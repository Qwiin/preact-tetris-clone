import {useContext, useState} from 'preact/hooks';
import {  getAuth, signInWithEmailAndPassword   } from 'firebase/auth';
import { UserContext, UserState } from './AppProvider';
import { Link } from 'preact-router';
import { PATH_SIGNUP } from './App2';
 
const Login = () => {

    // const userState: UserState = useContext(UserContext);

    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
       
    const onLogin = (e:any) => {
        e.preventDefault();
        signInWithEmailAndPassword(getAuth(), email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            import('./HomePage').then(module => module.default)
            console.log(user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
        });
       
    }
 
    return(
        <>
            <main >        
                <section>
                    <div className="tw-bg-slate-700">                                            
                        <p> Open Auth </p>                       
                                                       
                        <form id="LoginForm">                                              
                            <div className="tw-flex tw-flex-row">
                                <label htmlFor="email-address" className="tw-w-20 tw-text-left">
                                    Email
                                </label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"                                    
                                    required                                                                                
                                    placeholder="Email address"
                                    onChange={(e:any)=>setEmail(e.target.value)}
                                />
                            </div>

                            <div className="tw-flex tw-flex-row">
                                <label htmlFor="password" className="tw-w-20 tw-text-left">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"                                    
                                    required                                                                                
                                    placeholder="Password"
                                    onChange={(e:any)=>setPassword(e.target.value)}
                                />
                            </div>
                                                
                            <div>
                                <button                                    
                                    onClick={onLogin}                                        
                                >      
                                    Login                                                                  
                                </button>
                            </div>                               
                        </form>
                       
                        <p className="text-sm text-white text-center">
                            No account yet? {' '}
                            <nav>
                              <Link className="active" href={PATH_SIGNUP}>
                                Sign Up
                              </Link>
                            </nav>
                        </p>
                                                   
                    </div>
                </section>
            </main>
        </>
    )
}
 
export default Login;