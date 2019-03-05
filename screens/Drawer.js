import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity,Image,ScrollView} from 'react-native';
import {Navigation} from 'react-native-navigation';

import SQLite from 'react-native-sqlite-storage';
let DB;
const getDB = () => DB ? DB : DB = SQLite.openDatabase({ name: 'sqlitedb.db', createFromLocation: 1 });

type Props = {};
export default class Drawer extends Component<Props> {

  constructor(props) {
    super(props);
    getDB();
    this.state = {
      tests: []
    };
    this.getAlltestData(DB);
  }

  goToScreen = (screenName) => {
    Navigation.mergeOptions('drawerID', {
      sideMenu: {
        left: {
          visible: false
        }
      }
    })
    Navigation.push('MAIN_STACK', {
      component: {
        name: screenName,
      }
    })
  }
  
  goToTest = (screenName, testId) => {
    Navigation.mergeOptions('drawerID', {
      sideMenu: {
        left: {
          visible: false
        }
      }
    })
    Navigation.push('MAIN_STACK', {
      component: {
        name: screenName,
        passProps: {
          testId: testId
        },
      }
    })
  }
  
  getAlltestData = (DB) => {
    DB.transaction((tx) => {
      tx.executeSql('SELECT * FROM tests;', [], (tx, results) => {
        let tests = [];
        for(let i = 0; i < results.rows.length; i++) {
            tests[i] = results.rows.item(i);
        }
        this.setState({
          tests: tests
        });
      });
    });
  }

  render() {
    rows = []
    for(let i = 0; i < this.state.tests.length; i++) {
      rows.push(
        <View key={i} style={styles.menuButton}>
          <TouchableOpacity key={i} onPress={() => this.goToTest('Test', this.state.tests[i].id)}>
            <Text style={styles.menuText}>{this.state.tests[i].name}</Text>
          </TouchableOpacity>
        </View>
      )
    }
    
    return (

      <View style={styles.container}>
        <ScrollView>
          <View style={{marginTop:10,marginBottom:40, paddingBottom:10,alignItems:'center'}}>
            <Image style={{width:275,height:135,padding:10}} source={require("../imgg/logo.jpg")}/>
          </View>

            <View style={styles.menuTouchable}>
            <TouchableOpacity style={styles.menuButton} onPress={() => this.goToScreen ('App')} >
              <Text style={styles.menuText}>Home Page</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={() => this.goToScreen ('Results')} >
            <Text style={styles.menuText}>Results</Text>
            </TouchableOpacity>

         </View>
        {rows}
        </ScrollView>
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'stretch',
    backgroundColor: 'silver',
  },
  
  text: {
    textAlign: 'center',
    padding: 30,
  },
  
  results: {
    justifyContent: 'center',
    alignItems: 'stretch',
    margin: 2,
    borderColor: '#2A4944',
    borderWidth: 1,
    
	borderRadius: 20,
  },
  menuButton:{
    backgroundColor: 'white',
     margin:10,
    borderWidth:1,
 
    
  },
  menuText:{
    textAlign:'center',
    fontSize:20,
    padding:10,
    color:'black'
  },
  menuTouchable:{
    alignItems:'center'
  }
});
