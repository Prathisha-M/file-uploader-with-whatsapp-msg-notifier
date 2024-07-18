import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { PERMISSIONS, request } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/FontAwesome';
import { sendWhatsAppMessage } from './whatsappMsg';

global.varlink = 'http://192.168.29.42:3000';

const App = () => {
  const [fileResponse, setFileResponse] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    console.log("File response updated:", fileResponse);
  }, [fileResponse]);

  const handleDocumentSelection = async () => {
    try {
      const readPermission = await request(
        Platform.OS === 'android' ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE : PERMISSIONS.IOS.MEDIA_LIBRARY
      );
      const writePermission = await request(
        Platform.OS === 'android' ? PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE : PERMISSIONS.IOS.MEDIA_LIBRARY_WRITE_ONLY
      );

      if (readPermission === 'granted' && writePermission === 'granted') {
        const response = await DocumentPicker.pick({
          type: [DocumentPicker.types.allFiles],
        });

        setFileResponse(response[0]);
      } else {
        Alert.alert('Permission Denied', 'Please grant storage permissions to proceed.');
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Document picker cancelled');
      } else {
        console.log('Error selecting file:', err);
        Alert.alert('Error', 'Failed to select file.');
      }
    }
  }

  const uploadFile = async () => {
    if (!fileResponse) {
      Alert.alert('Error', 'Please select a file.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileResponse.uri,
        type: fileResponse.type,
        name: fileResponse.name,
      });

      const response = await fetch(`${global.varlink}/uploadFile`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        setUploadStatus('File uploaded successfully!');
        // Call sendWhatsAppMessage function here
        const mobileNumber = '6383559767'; // Replace with the actual mobile number
        const message = 'Your file has been uploaded successfully!';
        await sendWhatsAppMessage(mobileNumber, message);
      } else {
        setUploadStatus('File upload failed.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus('File upload failed.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.fileName}>
        {fileResponse ? `Selected File: ${fileResponse.name}` : ''}
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleDocumentSelection}>
        <Icon name="file" size={20} color="white" />
        <Text style={styles.buttonText}> Select File</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={uploadFile}>
        <Icon name="upload" size={20} color="white" />
        <Text style={styles.buttonText}> Upload File</Text>
      </TouchableOpacity>
      {uploadStatus ? (
        <Text style={styles.uploadStatus}>{uploadStatus}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  fileName: {
    marginTop: 20,
    marginBottom: 20,
    color: 'white',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'green',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
  },
  uploadStatus: {
    marginTop: 20,
    color: 'green',
  },
});

export default App;
