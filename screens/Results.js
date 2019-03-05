import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, ListView, RefreshControl} from 'react-native';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

type Props = {};
export default class Results extends Component<Props> {
  constructor(){
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state={
      refreshing: false,
      holdResults: ds.cloneWithRows([])
      // dataSource: ds.cloneWithRows([
      //   {
      //     nick: 'Maek',
      //     score: 18,
      //     total: 20,
      //     type: 'historia',
      //     date: '2018-11-22'
      //   },
      //   {
      //     nick: 'Marek',
      //     score: 18,
      //     total: 20,
      //     type: 'historia',
      //     date: '2018-11-22'
      //   },
      //   {
      //     nick: 'Maek',
      //     score: 18,
      //     total: 20,
      //     type: 'historia',
      //     date: '2018-11-22'
      //   },
      //   {
      //     nick: 'Marek',
      //     score: 18,
      //     total: 20,
      //     type: 'historia',
      //     date: '2018-11-22'
      //   }
        
      // ]) 
    }
 }
 componentDidMount() {
  return fetch('https://pwsz-quiz-api.herokuapp.com/api/results')
    .then((response) => response.json())
    .then((responseJson) => {
      const resp = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      this.setState({
        holdResults: resp.cloneWithRows(responseJson)
      })
    })
    .catch((error) => {
      console.error(error);
    });
}

 



_renderRow(rowData){
 

    return(
      <View style={styles.container}>
        <View style={styles.rows}>
          <Text style={styles.column}>{rowData.nick}</Text>
          <Text style={styles.column}>{rowData.score}</Text>
          <Text style={styles.column}>{rowData.total}</Text>
          <Text style={styles.column}>{rowData.type}</Text>
          <Text style={styles.column}>{rowData.date}</Text>
        </View>
      </View>
    )
  }

  _onRefresh = () => {
    this.setState({refreshing: true});
    this.fetchData().then(() => {
      this.setState({refreshing: false});
    });
  }

  fetchData = async() => {
    this.componentDidMount();
  }
  
  render() {
    const state = this.state;
   
     return (
        <View style={styles.container}>
       
           <View style={styles.header}>
        <Text style={styles.title}>Nick</Text>
        <Text style={styles.title}>Score</Text>
        <Text style={styles.title}>Total</Text>
        <Text style={styles.title}>Type</Text>
        <Text style={styles.title}>Date</Text>
        
      </View>
          <ListView
              dataSource={this.state.holdResults}
              renderRow={this._renderRow}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this._onRefresh}/>
              }/>
        </View>
          )
       
}

}
const styles = StyleSheet.create({
  container: { flex: 1, },
  header: {
    flexDirection: 'row',
    
 },
  rows: {
   flexDirection: 'row',
  },
  
  title:{
    width:72,
    padding:15,
    borderWidth:1,
    fontWeight:'bold',
    backgroundColor: '#66cc66',
    
  },
  column:{
    width:72,
    padding:15,
    borderWidth:1,
    backgroundColor: '#98FB98',
   
  },
  text: { margin: 6 }
});
