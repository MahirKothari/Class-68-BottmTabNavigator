import React  from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert,ToastAndroid} from 'react-native';
import {BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import firebase from 'firebase';
import db from '../Config'

export default class TransactionScreen extends React.Component{
    constructor(){
        super()
        this.state={
            hasCameraPermissions:null,
            scanned:false,
          scannedBookId:'',
          scannedStudentId:'',
            buttonState:'normal',
            transactionMessage:''
        }
    }
    getCameraPermissions=async(Id)=>{
    const {status}=await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
        hasCameraPermissions:status==='granted',
        buttonState:Id,
        scanned:false
    })
    }
    handledBarcodeScanned=async({type,data})=>{
        const buttonState = this.state.buttonState
        if(buttonState == "bookId"){
        this.setState({
            scanned:true,
           scannedBookId:data,
            buttonState:'normal'
        })
    }
   else if(buttonState == "studentId"){
        this.setState({
            scanned:true,
           scannedStudentId:data,
            buttonState:'normal'
        })
    }
    }
    initiateBookIssue = async()=>{
        db.collection('transactions').add({
            studentId:this.state.scannedStudentId,
            bookId:this.state.scannedBookId,
            date:firebase.firestore.Timestamp.now().toDate(),
            transactionType:'issue'
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            bookAvailability:false
        })
        db.collection('students').doc(this.state.scannedStudentId).update({
            numberOfBooksIssued:firebase.firestore.FieldValue.increment(1)
        })
        this.setState({
            scannedStudentId:'',
            scannedBookId:''
        })
    }
    initiateBookReturn = async()=>{
        db.collection('transactions').add({
            studentId:this.state.scannedStudentId,
            bookId:this.state.scannedBookId,
            date:firebase.firestore.Timestamp.now().toDate(),
            transactionType:'return'
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            bookAvailability:true
        })
        db.collection('students').doc(this.state.scannedStudentId).update({
            numberOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
        })
        this.setState({
            scannedStudentId:'',
            scannedBookId:''
        })
    }
    handleTransaction = async()=>{
       var transactionType = await this.checkBookEligibility()
       if(!transactionType){
       Alert.alert('the book does not exist in the library')
       this.setState({
           scannedBookId:'',
           scannedStudentId:''
       })
       }
       else if(transactionType === 'issue'){
           var isStudentEligible = await this.checkStudentEligibilityForBookIssue()
           if(isStudentEligible){
               this.initiateBookIssue()
               Alert.alert('book issued to the student')
           }
       }
       else{
        var isStudentEligible = await this.checkStudentEligibilityForBookReturn()
        if(isStudentEligible){
            this.initiateBookReturn()
            Alert.alert('book returned to the library')
        }
       }
    }
    checkBookEligibility=async()=>{
        const bookRef = await db.collection('books').where('bookId','==',this.state.scannedBookId).get()
        var transactionType = ''
        if(bookRef.docs.length == 0){
        transactionType = false
        }
        else{
            bookRef.docs.map((doc)=>{
             var book = doc.data()
             if(book.bookAvailability){
                 transactionType = 'issue'
             }
             else{
                 transactionType = 'return'
             }
            })
        }
        return transactionType 
    }
    checkStudentEligibilityForBookIssue = async()=>{
        const studentRef = await db.collection('students').where('studentId','==',this.state.scannedStudentId).get()
        var isStudentEligible = ''
        if(studentRef.docs.length == 0){
       isStudentEligible = false
       this.setState({
           scannedStudentId:'',
           scannedBookId:''
       })
       Alert.alert('studenId does not exist')
        }
        else{
            studentRef.docs.map((doc)=>{
             var student = doc.data()
             if(student.numberOfBooksIssued<2){
                 isStudentEligible = true
             }
             else{
                 isStudentEligible = false
                 Alert.alert('the student has already issued 2 books')
                 this.setState({
                    scannedStudentId:'',
                    scannedBookId:''
                })
             }
            })
        }
        return isStudentEligible
    }
    checkStudentEligibilityForBookReturn = async()=>{
        const studentRef = await db.collection('transactions').where('bookId','==',this.state.scannedBookId).limit(1).get()
        var isStudentEligible = ''
            studentRef.docs.map((doc)=>{
             var student = doc.data()
             if(student.studentId === this.state.scannedStudentId){
                 isStudentEligible = true
             }
             else{
                 isStudentEligible = false
                 Alert.alert('the book was not issued by the student')
                 this.setState({
                    scannedStudentId:'',
                    scannedBookId:''
                })
             }
            })
        return isStudentEligible
    }
    render(){
        const hasCameraPermissions=this.state.hasCameraPermissions;
        const scanned=this.state.scanned;
        const buttonState=this.state.buttonState;
        if(buttonState !== 'normal'&& hasCameraPermissions){
         return(
             <BarCodeScanner onBarCodeScanned={scanned ? undefined:this.handledBarcodeScanned} style={StyleSheet.absoluteFillObject}>

             </BarCodeScanner>
         )
        }
        else if(buttonState==='normal'){
      return(
          <View style={styles.container}>
              <View>
                  <Image source={require ('../assets/booklogo.jpg')} style={{width:200,height:200}}>

                  </Image>
                  <Text style={{textAlign:'center',fontSize:30}}>
                      Wily
                  </Text>
              </View>
              <View style={styles.inputView}>
                  <TextInput style={styles.inputBox} placeholder='bookId' value={this.state.scannedBookId} onChangeText={
                      (text)=>{
                          this.setState({
                            scannedBookId:text
                          })
                      }
                  }>
                   
                  </TextInput>
                  <TouchableOpacity style={styles.scannedButton} onPress={ ()=>{this.getCameraPermissions("bookId")}}>
               <Text style={styles.buttonText}>
              Scan 
               </Text>
           </TouchableOpacity>
              </View>
              <View style={styles.inputView}>
                  <TextInput style={styles.inputBox} placeholder='studentId' value={this.state.scannedStudentId} onChangeText={
                      (text)=>{
                          this.setState({
                            scannedStudentId:text
                          })
                      }
                  }>
                   
                  </TextInput>
                  <TouchableOpacity style={styles.scannedButton} onPress={ ()=>{this.getCameraPermissions("studentId")}}>
               <Text style={styles.buttonText}>
              Scan 
               </Text>
           </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.submitButton}>
                  <Text style={styles.submitButtonText} onPress={async()=>{
                      var transactionMessage = await this.handleTransaction()
                  }}>
                      Submit
                  </Text>
              </TouchableOpacity>
          </View>
      )
        }
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    displayText:{
        fontSize:15
    },
    scannedButton:{
     backgroundColor:'#2196f3',
     width:50,
     borderWidth:1.5,
     borderLeftWidth:0
    },
    buttonText:{
        fontSize:20,
        textAlign:'center',
        marginTop:10
    },
    inputView:{
    flexDirection:'row',
    margin:20,
    width:200,
    height:40,
    borderWidth:1.5,
    borderRightWidth:0,
    fontSize:20
    },
    submitButton:{
        backgroundColor:'#fbc02d',
        width:100,
        height:50
    },
    submitButtonText:{
        padding:10,
        textAlign:'center',
        fontSize:20,
        fontWeight:'bold',
        color:'white'
    }
})