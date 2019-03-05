import React, {Component} from 'react';
import {AsyncStorage, ScrollView, Platform, StyleSheet, Text, View, TouchableOpacity, TextInput,Image} from 'react-native';
import {Navigation} from 'react-native-navigation';

import SQLite from 'react-native-sqlite-storage';
let DB;
const getDB = () => DB ? DB : DB = SQLite.openDatabase({ name: 'sqlitedb.db', createFromLocation: 1 });

type Props = {};
export default class Test extends Component<Props> {
  constructor(props) {
    super(props);
    getDB();
    this.state = {
      refreshing: false,
      id: '',
      name: '',
      description: '',
      tasks: [{
        question: '',
        answers: []
      }],
      tags: [],
      currentQuestion: 0,
      score: 0,
      nick: ''
    };
    this.getAlltestData(DB);
  }

  getAlltestData = (DB) => {
    DB.transaction((tx) => {
      tx.executeSql('SELECT * FROM test WHERE id = ?;', [this.props.testId], (tx, results) => {
        let t = results.rows.item(0);
        this.setState({
          id: t.id,
          name: t.name,
          description: t.description,
          tasks: JSON.parse(t.tasks),
          tags: JSON.parse(t.tags)
        });
      });
    });
  }

  saveTestResults = () => {
    fetch('https://pwsz-quiz-api.herokuapp.com/api/result', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nick: this.state.nick,
        score: this.state.score,
        total: this.state.tasks.length,
        type: this.state.tags[0],
        date: new Date().toISOString().split('T')[0]
      }),
    })
    .then(() => {
      Navigation.pop('MAIN_STACK');
    })
    .catch((error) => {
      alert('Błąd podczas wysyłania wyniku.\nSprawdź połączenie z internetem!');
    });
  }
  
  buttonPress = (correctAnswer) => {
    if( correctAnswer ) {
      this.setState({score: this.state.score + 1});
    }
    this._onRefresh();
  }
  
  _onRefresh = () => {
    this.setState({
      refreshing: true,
      currentQuestion: this.state.currentQuestion + 1
    });
    this.setState({refreshing: false});
  };
  goToMenu = (screenName) => {
    Navigation.mergeOptions('drawerID', {
      sideMenu: {
        left: {
          visible: true
        },
      }
    });
  }
  

  render() {
    if( this.state.currentQuestion === this.state.tasks.length ) {
      return(
        <View style={styles.container}>
     
          <Text style={styles.textSoruce}>Twój wynik to:</Text>
          <Text style={styles.textLength}>{this.state.score} / {this.state.tasks.length}</Text>

          <Text style={styles.textSendName}>Wprowadź swój nick:</Text>
          <TextInput style={styles.inputText} onChangeText={(nick) => this.setState({nick})} value={this.state.nick}
          />
          
          <TouchableOpacity style={styles.buttonSend} onPress={() => this.saveTestResults()}>
            <Text style={styles.send}>Wyślij!</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      let answers = []
      for(let j = 0; j < this.state.tasks[this.state.currentQuestion].answers.length; j++) {
        answers.push(
          <TouchableOpacity key={j} style={styles.button} onPress={() => this.buttonPress(this.state.tasks[this.state.currentQuestion].answers[j].isCorrect)}>
            <Text style={styles.text}>{this.state.tasks[this.state.currentQuestion].answers[j].content}</Text>
          </TouchableOpacity>
        );
      }

      return (
        <View style={styles.container}>
             <View style={styles.top}>
        <Text style={styles.text1}>{this.state.name}</Text>
         <View style={styles.menu}>
         
            <TouchableOpacity style={styles.image_menu} onPress={() => this.goToMenu('Drawer')}>
               <Image style={styles.image_menu} source={require("../imgg/open-menu-01-512.png")}/>
            </TouchableOpacity> 
          </View>
 
         
       </View>
      
          <ScrollView>
            <View style={styles.testView}>
              <View style={styles.testHeader}>
                <Text style={styles.text3}>Pytanie {this.state.currentQuestion+1} / {this.state.tasks.length}:</Text>
                <Text style={styles.text2}>{this.state.tasks[this.state.currentQuestion].question}</Text>
              </View>
              <View>
                {answers}
              </View>
            </View>
          </ScrollView>
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
   
  },
  textSendName:{
    fontSize:20,
    textAlign: 'center',
  },
  textLength:{
    fontSize:40,
    color:'#66cc66',
    textAlign: 'center',
  },
  textSoruce:{
    fontSize:20,
    textAlign: 'center',
  },
  inputText:{
    height: 40,
     borderColor: 'gray',
      borderWidth: 1,
      marginTop:20,
      marginBottom:20,
      marginLeft:50,
      marginRight:50,
  },
  testView: {
    padding: 10,
    margin: 10,
  },
  testHeader: {
   
    alignItems: 'center',
    
 
  },
  send:{
    textAlign:'center',
    padding:10,
    fontWeight:'bold',
    color: 'white',
    fontSize:20,



  },
  buttonSend:{
   
    backgroundColor:'#66cc66'
  },
  button: {
    padding: 5,
    borderWidth: 1,
    paddingLeft:10,
    paddingRight:10,
    paddingTop:20,
    paddingBottom:20,
    borderColor: 'black',
    borderStyle: 'solid',
    width: '100%',
    margin: 2,
   
   
  },
  text: {
    textAlign: 'center',
    fontFamily: 'RobotoCondensed-Regular',
  },
  text2: {
    padding: 3,
    margin: 5,
    alignItems: 'flex-start',
    fontSize: 20,
    color:'#66cc66'
  },
  text3: {
    padding: 3,
    margin: 5,
    alignItems: 'flex-start',
    fontSize: 15,
  },
  textHeader: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight:'bold'
  },
  text1:{
    flex:6,
    fontWeight:'bold',
    alignItems: 'center',
    fontSize: 20,
    paddingTop:10,
    marginLeft:20,
    color: 'black'
  },
  menu:{
    flex:2,
    paddingTop:15,
    paddingRight:5,
    marginLeft:10,
 
  },
  top:{
    height:70,
    backgroundColor: '#66cc66',
     borderBottomWidth:1,
    flexDirection: 'row'
    
  },
  image_menu:{
    width:40,
    height:40,
    marginLeft:10
  },
});
