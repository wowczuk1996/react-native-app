/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, ScrollView, StatusBar, TouchableOpacity, AsyncStorage, Image}  from 'react-native';
import {Navigation} from 'react-native-navigation';
import FirstScreen from './screens/FirstScreen.js';

import SQLite from 'react-native-sqlite-storage';
let DB;
const getDB = () => DB ? DB : DB = SQLite.openDatabase({ name: 'sqlitedb.db', createFromLocation: 1 });

type Props = {};
export default class App extends Component<Props> {

  constructor(props) {
    super(props);
    getDB();
    this.state = {
      internetConnection: true,
      tests: []
    };
  }
  
  componentWillMount = async() => {
    try {
      const value = await AsyncStorage.getItem('databaseDownloadDate');
      if (value == null) {
        this.downloadTests();
      } else {
        let now = new Date();
        let then = new Date(JSON.parse(value).value);
        const utc1 = Date.UTC(then.getFullYear(), then.getMonth(), then.getDate());
        const utc2 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
        if( Math.floor((utc2 - utc1) / 86400000) >= 1 ) {
          this.downloadTests();
        } else {
          this.downloadDataFromDatabase(DB);
        }
      }
    } catch (error) {}
  }
  
  downloadTests = () => {
    fetch('https://pwsz-quiz-api.herokuapp.com/api/tests')
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({tests: responseJson});
      this.addTestsToDatabase(DB, responseJson);
      this.downloadTestData();
    })
    .catch((error) => {
      this.setState({internetConnection: false});
      alert('Błąd podczas pobierania listy testów.\nSprawdź połączenie z internetem!');
    });
  }
  
  addTestsToDatabase = (DB, data) => {
    DB.transaction((tx) => {
      tx.executeSql('DELETE FROM tests; DELETE FROM test; VACUUM;', [], (tx, results) => {});
      for(let i = 0; i < data.length; i++) {
        tx.executeSql(
          'INSERT INTO tests (id, name, description, tags, level, numberOfTasks) VALUES (?, ?, ?, ?, ?, ?);',
          [data[i].id, data[i].name, data[i].description, JSON.stringify(data[i].tags), data[i].level, data[i].numberOfTasks]
        );
      }
    });
  }
  
  downloadTestData = () => {
    for(let i = 0; i < this.state.tests.length; i++) {
      fetch('https://pwsz-quiz-api.herokuapp.com/api/test/' + this.state.tests[i].id)
      .then((data) => data.json())
      .then((d) => {
        DB.transaction((tx) => {
          tx.executeSql(
            'INSERT INTO test (id, name, description, level, tasks, tags) VALUES (?, ?, ?, ?, ?, ?);',
            [d.id, d.name, d.description, JSON.stringify(d.level), JSON.stringify(d.tasks), JSON.stringify(d.tags)]
          );
        });
        AsyncStorage.setItem('databaseDownloadDate', JSON.stringify({"value":Date()}));
      })
      .catch((error) => {
        this.setState({internetConnection: false});
        alert('Błąd podczas pobierania danych szczegółowych testów.\nSprawdź połączenie z internetem!');
      });
    }
  }
  
  downloadDataFromDatabase = (DB) => {
    DB.transaction((tx) => {
      tx.executeSql('SELECT * FROM tests;', [], (tx, results) => {
        var tests = [];
        for(let i = 0; i < results.rows.length; i++) {
          tests[i] = results.rows.item(i);
        }
        this.setState({ tests: tests });
      });
    });
  }

  goToMenu = (screenName) => {
    Navigation.mergeOptions('drawerID', {
      sideMenu: {
        left: {
          visible: true
        },
      }
    });
  }
  
    
  goToScreen = (screenName, testId) => {
    Navigation.push(this.props.componentId, {
      component: {
        name: screenName,
        passProps: {
          testId: testId
        },
      }
    })
  }

  

  render() {
    if( !this.state.internetConnection ) {
      return(
        <View style={styles.container}>
          <Text style={styles.text}>Musisz włączyć internet, by ściągnąć bazę danych!</Text>
        </View>
      );
    } else {

      let rows = []
      for(let i = 0; i < this.state.tests.length; i++) {
        rows.push(
          <View key={i} style={styles.view}>
            <TouchableOpacity key={i} onPress={() => this.goToScreen('Test', this.state.tests[i].id)}>
              <Text style={styles.text}>{this.state.tests[i].name}</Text>
              <Text style={styles.tags}>{this.state.tests[i].tags}</Text>
              <Text style={styles.description}>{this.state.tests[i].description}</Text>
            </TouchableOpacity>
          </View>
        )
      }
      
      return (
        <View style={styles.container}>
          <FirstScreen />
          <View style={styles.top}>
        <Text style={styles.text1}>Home Page</Text>
         <View style={styles.menu}>
         
            <TouchableOpacity style={styles.image_menu} onPress={() => this.goToMenu('Drawer')}>
               <Image style={styles.image_menu} source={require("./imgg/open-menu-01-512.png")}/>
            </TouchableOpacity> 
          </View>
 
         
       </View>
          <View style={styles.testsview}>
            <ScrollView>
              {rows}

            <TouchableOpacity style={styles.nextText} onPress={() => this.goToScreen('Results')}>
              <Text style={styles.results}>Ekran wyników</Text>
            </TouchableOpacity>
            </ScrollView>
          </View>



        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
    flexDirection: 'column',
  },
  testsview: {
    flex: 11,
  },
  footer: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#44A8DD',
    padding: 10,
    borderColor: '#2A4944',
    borderWidth: 1,
    borderRadius: 20,
  },
  view: {
    justifyContent: 'center',
    alignItems: 'stretch',
    borderColor: 'black',
    borderWidth: 1,
    padding:20,
    margin:10,
    height:150
  },
  results:{
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize:20,  
  },
  text: {
    textAlign: 'center',
    fontSize:20,
    color: '#66cc66',
    padding: 5,
  },
  tags:{
    textAlign: 'center',
    fontWeight: 'bold',
  },
  description:{
    textAlign: 'center',
  },
  nextText: {
    color:'white',
    backgroundColor: '#66cc66',
      paddingLeft:20,
      paddingBottom:10,
    paddingTop: 10,
    paddingRight: 20,
    fontSize: 20
  },
  text1:{
    flex:6,
    marginRight:30,
    alignItems: 'center',
    fontSize: 30,
    paddingTop:5,
    marginLeft:80,
    color: 'black'
  },
  menu:{
    flex:2,
    paddingTop:5,
    paddingRight:30,
    marginLeft:10,
    marginBottom:30
  },
  top:{
    flex:1,
    backgroundColor: '#66cc66',
    
    borderBottomWidth:1,
    flexDirection: 'row'
    
  },
  button_menu:{
    paddingTop:10
  },
  image_menu:{
    width:40,
    height:40,
    marginLeft:10
  },
});
