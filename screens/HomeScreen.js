import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import { useCollectionData } from 'react-firebase-hooks/firestore';

//dependencies firebase, expo-location, expo-device 

const HomeScreen = () => {
  const firestore = firebase.firestore();
  
  const locationRef = firestore.collection('locations');


  const trackLocation = async(e) => {
    console.log("Success");
    Location.requestPermissionsAsync();
    var lat = 0;
    var long = 0;

    try {
      Location.getCurrentPositionAsync({})    
      let location = await Location.getCurrentPositionAsync();
      lat = await location.coords.latitude
      long = await location.coords.longitude
      
    } catch(e) {
      console.log("location failed");
    }

    await locationRef.add({
      location: new firebase.firestore.GeoPoint(lat, long),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: Device.osBuildId,
      covid: false
    })

    // let response = await fetch('https://3f882b53.us-south.apigw.appdomain.cloud/random-numbers');
    // let responseJson = await response.json();
    // console.log(responseJson[0]);
  }

  const haveCovid = async(e) => {
    console.log("Success");
    const collection = firestore.collection("locations")
    const newDocumentBody = {
      covid: true
    }

    collection.where('uid', '==', Device.osBuildId).get().then(response => {
      let batch = firebase.firestore().batch()
      response.docs.forEach((doc) => {
          const docRef = doc.ref
          batch.update(docRef, newDocumentBody)
      })
      batch.commit().then(() => {
          console.log(`updated all documents inside ${collectionName}`)
      })
    })
  }

  const comparesLocations = () => {
    const haversine = require('haversine');
    var nearby = [];
    firestore.collection('locations').where('covid', '==', true).limit(2).get().then(snapshot => {
      firestore.collection('locations').where('uid', '==', Device.osBuildId).get().then(snapshot2 => {
        snapshot.docs.forEach(doc1 => {
          snapshot2.docs.forEach(doc2 => {
            let start = {latitude: doc1.data().location.latitude, longitude: doc1.data().location.longitude}
            let end = {latitude: doc2.data().location.latitude, longitude: doc2.data().location.longitude}
            if (haversine(start, end, {threshold: 100, unit: 'meter'})) {
              nearby.push(doc1.data().location);
            }
          })
        })
      console.log(nearby);
      })   
    })
  }



  // const alerts = async(e) => {
  //   const collection = firestore.collection("locations")
    

  //   collection.where('uid', '==', Device.osBuildId).get().then(response => {
  //     response.docs.forEach(doc => {
  //       console.log(doc.data());
  //     })
  //   }) 
  // }

  // const checks = async(e) => {
  //   const haversine = require('haversine');
  //   const collection = firestore.collection("locations");
  
  //   try {
  //     collection.where('uid', '==', "2").get().then(my_response => {
  //       collection.where('covid', '==', true).get().then(covid_response => {
  //         var nearby = [];
  //         my_response.docs.forEach(my_location => {
  //           console.log("TEST")
  //           console.log(my_location.getdata())
  //           covid_response.docs.forEach(other_location => { 
  //             let start = {latitude: my_location.data().location.latitude, longitude: my_location.data().location.longitude}
  //             let end = {latitude: other_location.data().location.latitude, longitude: other_location.data().location.longitude}
  //             if (haversine(start, end, {threshold: 100, unit: 'meter'})) {
  //               nearby.push(other_location);
  //             }
  //           })
  //         })
  //         //console.log(nearby);
  //       })
  //     }) 
  //   } catch {
  //     console.log("fail");
  //   }
  // }

  //function distance()

  



  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        //onPress={checks}
      >
        <Text style={styles.text}>
          Track
        </Text>
      </TouchableOpacity>
      <ScrollView style={styles.scrollview}>
        <Text>
          Scroll text.
        </Text>
      </ScrollView>

      <TouchableOpacity 
        style={styles.button}
        //onPress={updateCovid}
      >
        <Text style={styles.text}>
          Covid
        </Text>
      </TouchableOpacity>

      {/* <StatusBar style="auto" /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    height: 60,
    padding: 10,
    minWidth: 90,
    maxWidth: 90,
    backgroundColor: '#66b0ff',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  scrollview: {

  }
});

export default HomeScreen;
