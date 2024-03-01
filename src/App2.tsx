// import {h} from 'preact';
import HomePage from './HomePage';
// import Signup from './SignUp';
// import Login from './Login';
import Router, { route } from 'preact-router';
import { Component } from 'preact';
import AsyncRoute from 'preact-async-route';
import AppHeader from './AppHeader';
import { useEffect, useReducer } from 'preact/hooks';
import AppProvider, { UserProvider } from './AppProvider';

export const PATH_HOME   = '/';
export const PATH_SIGNUP = '/signup';
export const PATH_LOGIN  = '/login';
export const PATH_PROFILE  = '/profile';

function App2() {
 
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // return (
  //   <Router onChange={this.handleRoute}>
  //     <HomePage/>
  //     <Profile path="/profile" />
  //   </Router>
  // );

  return (
    <div class="app-wrapper">
      <UserProvider>
      <></>
      <AppProvider>
      <AppHeader />
      <Router>
        {/*<Home loggedIn={true} path="/" />*/}
        <PrivateRoute onRouteComplete={()=>{
          forceUpdate(1);
          
          console.log("..................ROUTE_COMPLETE......................");
        }} path={PATH_HOME} component={() => <HomePage />} />

        <AsyncRoute
          path={PATH_SIGNUP}
          getComponent={() =>
            // import('./SignUp').then(module => module.default)
            import('./GoogleSignUp').then(module => module.default)
          }
        />
        <AsyncRoute
          path={PATH_LOGIN}
          getComponent={() =>
            import('./Login').then(module => module.default)
          }
        />
        <AsyncRoute
          path={PATH_PROFILE}
          getComponent={() =>
            import('./Profile').then(module => module.default)
          }
        />
        <NotFound default />
      </Router>
      </AppProvider>
      </UserProvider>
    </div>
  );
}
 
export default App2;


interface PrivateRouteProps {
  component: any;
  onRouteComplete: ()=>void;
}
class PrivateRoute extends Component<PrivateRouteProps> {

  // constructor(props: PrivateRouteProps) {
  //   super(props);
  // }

  render() {
    return (
      <AsyncRoute
        path={this.props.path ?? ""}
        getComponent={() => {
          return authenticateMock()
            .then(() => {
              this.props.onRouteComplete()
              return this.props.component
            }
            )
            .catch(reason => {
              console.log(reason);
              route('/login', true);
              return null;
            });
        }}
      />
    );
  }
}

export function authenticateMock() {
  return Promise.resolve(true);
  // return axios.post('https://www.mocky.io/v2/5a9647333200006e005e2d2c');
}

export const NotFound = (props: any) => (
  <section>
    <h2>Not Found - Path: {props.url}</h2>
  </section>
);


// class App2 extends Component {
//   // some method that returns a promise
  
  

//   handleRoute = async e => {
//     switch (e.url) {
//       case '/profile':
//         const isAuthed = await this.isAuthenticated();
//         if (!isAuthed) route('/', true);
//         break;
//     }
//   };

//   render() {
//     return (
//       <Router onChange={this.handleRoute}>
//         <Home path="/" />
//         <Login path="/login" />
//       </Router>
//     );
//   }
// }

// export default App;