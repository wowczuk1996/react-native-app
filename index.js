/** @format */

import {Navigation} from 'react-native-navigation';
import {Dimensions} from 'react-native';

import App from './App';
import Test from './screens/Test.js';
import Results from './screens/Results.js';
import Drawer from './screens/Drawer.js';

Navigation.registerComponent('App', () => App)
Navigation.registerComponent('Test', () => Test)
Navigation.registerComponent('Results', () => Results)
Navigation.registerComponent('Drawer', () => Drawer)

const { width } = Dimensions.get('window');
Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setDefaultOptions({
    layout: {
      orientation: ['portrait']
    },
    topBar: {
      elevation: 0,
      visible: false,
      drawBehind: true,
      animate: false,
      buttonColor: 'black',
      title: {
        color: 'black',
        alignment: 'center'
      },
      background: {
        color: 'transparent'
      }
    }
  });

  Navigation.setRoot({
    root: {
      sideMenu: {
        left: {
          component: {
            id: 'drawerID',
            name: 'Drawer',
            fixedWidth: width
          }
        },
        center: {
          stack: {
            id: 'MAIN_STACK',
            children: [
              {
                component: {
                  name: 'App',
                },
              },
            ]
          }
        }
      },
    }
  });
});
