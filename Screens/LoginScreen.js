import React from 'react'
import {View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert,ToastAndroid,FlatList,KeyboardAvoidingView} from 'react-native';
import {BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import firebase from 'firebase';
import db from '../Config'

export default class LoginScreen extends React.Component{
   constructor(){
       super()
       this.state = {
           emailId:'',
           password:''
       }
   }
   login = async(email,password)=>{
       if(email&&password){
           try{
               const response = await firebase.auth().signInWithEmailAndPassword(email,password)
               if(response){
                   this.props.navigation.navigate('Transaction')
               }
           }
           catch(error){
               switch(error.code){
                   case 'auth/user-not-found':
                       Alert.alert('user does not exist')
                       break
                   case 'auth/invalid-email':
                       Alert.alert('Incorrect email')
                       break
               }
           }
       }
       else{
           Alert.alert('enter email and password')
       }
   }
    render(){
        return(
     <KeyboardAvoidingView style = {{alignItems:'center',marginTop:20}}>
     <View>
                  <Image source={require ('../assets/booklogo.jpg')} style={{width:200,height:200}}>

                  </Image>
                  <Text style={{textAlign:'center',fontSize:30}}>
                      Wily
                  </Text>
              </View>
              <View>
                  <TextInput style = {{width:300,height:40,borderWidth:1.5,fontSize:20,margin:10,paddingLeft:10}}placeholder = 'Enter EmailId' keyboardType = 'email-address' onChangeText = {(text)=>{
                      this.setState({
                          emailId:text
                      })
                  }}>
                      
                  </TextInput>
                  <TextInput style = {{width:300,height:40,borderWidth:1.5,fontSize:20,margin:10,paddingLeft:10}}placeholder = 'Enter Password' secureTextEntry = {true} onChangeText = {(text)=>{
                      this.setState({
                          password:text
                      })
                  }}>
                      
                  </TextInput>
              </View>
              <View>
                  <TouchableOpacity style = {{height:30,width:90,borderWidth:1,marginTop:20,paddingTop:5,borderRadius:7}} onPress = {()=>{
                      this.login(this.state.emailId,this.state.password)
                  }}>
                      <Text style = {{textAlign:'center'}}>
                          Login
                      </Text>
                  </TouchableOpacity>
              </View>
     </KeyboardAvoidingView>
        )
    }
}