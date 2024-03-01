import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useState } from 'preact/hooks';
// import { UserContext, UserState } from './AppProvider';
import { Link } from 'preact-router';

const Signup = () => {

  // const userState: UserState = useContext(UserContext);

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('');

  const onSubmit = async (e: any) => {
    e.preventDefault()

    await createUserWithEmailAndPassword(getAuth(), email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        import('./Login').then(module => module.default)
        console.log(user);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        // ..
      });
  }

  return (
    <main id="SignUp" className="tw-flex tw-items-center tw-justify-center tw-h-full tw-w-full">
      <section>
        <div>
          <div>
            <h1> Open Auth </h1>
            <form>
              <div>
                <label htmlFor="email-address">
                  Email address
                </label>
                <input
                  type="email"
                  label="Email address"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  required
                  placeholder="Email address"
                />
              </div>

              <div>
                <label htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  label="Create password"
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                />
              </div>

              <button
                type="submit"
                onClick={onSubmit}
              >
                Sign up
              </button>

            </form>

            <p>
              Already have an account?{' '}
              {/* <NavLink to="/login" >
                            Sign in
                        </NavLink> */}
              <Link className="active" href="/login">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Signup;
