import createDataContext from './createDataContext';
import trackerApi from '../api/tracker';
import { AsyncStorage } from 'react-native';
import { navigate } from '../navigationRef';

//This function only gets called by React directly
//when dispatch function is called.
const authReducer = (state, action) => {
  switch (action.type) {
    case 'add_error':
      //Take all properties out of state and add to
      //this new one. Overwrite property to update
      return { ...state, errorMessage: action.payload };
    case 'signin':
      //Rather than grabbing all state properties, wipe
      //errorMessage.
      return { errorMessage: '', token: action.payload };
    case 'clear_error_message':
      return { ...state, errorMessage: '' };
    default:
      return state;
  }
};

const clearErrorMessage = dispatch => () => {
  dispatch({ type: 'clear_error_message' });
};
const signup = dispatch => async ({ email, password }) => {
  //Make API request to sign up with email and password
  //If signed up then modify state and say we are authenticated.
  //If signing up fails reflect error somewhere.
  try {
    //Call to Api passing in email and password and bind to response
    const response = await trackerApi.post('/signup', { email, password });
    //Stores the token in Async Storage with response.date.token
    await AsyncStorage.setItem('token', response.data.token);
    //Once stored, dispatch an action to have a token piece of state.
    dispatch({ type: 'signin', payload: response.data.token });
    //navigate allows for navigation in files that don't normally have
    //access to navigation.
    navigate('TrackList');
  } catch (err) {
    //Update state to add error.
    dispatch({
      type: 'add_error',
      payload: 'Something went wrong with sign up.'
    });
  }
};

//Remember whenever dispatch is called React will automatically run
//Reducer.
const signin = dispatch => async ({ email, password }) => {
  try {
    const response = await trackerApi.post('/signin', { email, password });
    await AsyncStorage.setItem('token', response.data.token);
    dispatch({ type: 'signin', payload: response.data.token });
    navigate('TrackList');
  } catch (err) {
    dispatch({
      type: 'add_error',
      payload: 'Something went wrong with sign in.'
    });
  }

  //Try to sign in.
  //Handle success by updating state
  //Handle failure by showing error message (somehow)
};

const signout = dispatch => {
  return () => {
    //Somehow sign out.
  };
};
export const { Provider, Context } = createDataContext(
  authReducer,
  { signin, signout, signup, clearErrorMessage },
  //If error message, print to user inside error message
  //property
  { token: null, errorMessage: '' }
);
