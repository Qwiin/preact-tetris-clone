// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { initializeApp } from "firebase/app";
import { QuerySnapshot, addDoc, collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { useAppStore } from "./AppStore";
import { DocumentData, limit } from "firebase/firestore";
import { useCallback, useRef } from "preact/hooks";

// TODO: move to .env
const firebaseConfig = {
  apiKey: "AIzaSyA8JwDY65KIkmQlF-_8r4OfDCXHAOExf_8",
  authDomain: "preacttetris.firebaseapp.com",
  projectId: "preacttetris",
  storageBucket: "preacttetris.appspot.com",
  messagingSenderId: "565558573654",
  appId: "1:565558573654:web:b177a05d715b774621d9f7",
  measurementId: "G-B0NBKWX8WT"
};

/*

  Utility hook to save game results and getuserhistory

 */
export function useFirebase(): {
  saveResults: () => Promise<DocumentData>,
  getUserHistory: () => Promise<QuerySnapshot>
} {

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional

  const [appState] = useAppStore();

  // Initialize Firebase
  const app = useRef(initializeApp(firebaseConfig));
  // const analytics: Analytics = getAnalytics(app);
  // Initialize Cloud Firestore and get a reference to the service

  const db = useRef(getFirestore(app.current));

  const saveResults = useCallback((): Promise<DocumentData> => {

    const { game, stats, user } = appState;
    return new Promise<DocumentData>(async (resolve, reject) => {

      try {
        const docRef = await addDoc(collection(db.current, "games"), {

          user_uid: user.userInfo?.uid ?? "anonymous",
          user_displayname: "anonymous",

          game_mode: game.gameMode,
          starting_lvl: game.startingLevel,

          final_score: stats.score,
          lines_cleared: stats.lines,
          max_lvl: stats.level,
          moves: stats.pieceMoves,

          start_time: game.timeGameStart,
          end_time: game.timeGameEnd,
          pause_time: game.timePausedTotal,
          elapsed_time: game.timeGameEnd - game.timeGameStart - game.timePausedTotal

        });

        console.log("Document written with ID: ", docRef.id);
        resolve(docRef);
      }
      catch (e) {
        console.error("Error adding document: ", e);
        reject
      }
    });
  }, [appState.game.gameOver, appState.game.timeGameEnd]);

  const getUserHistory = useCallback(async () => {
    return new Promise<QuerySnapshot>(async (resolve, reject) => {
      try {
        const q = query(collection(db.current, "games"),
          where("user_uid", "==", appState.user.userInfo.uid),
          where("final_score", ">", 10000),
          limit(20)
        );
        const querySnapshot = await getDocs(q);
        resolve(querySnapshot);
      }
      catch (e) {
        reject(e);
      }
    });

  }, [appState.user])

  return { saveResults, getUserHistory };
}


export const samepleUserData: any = {
  "uid": "DHrOIrNYzLOYIKSGXIiMIlZRsPK2",
  "email": "jane.doe@gmail.com",
  "emailVerified": true,
  "displayName": "jane doe",
  "isAnonymous": false,
  "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocJII3w4FklFYX-YDFZtJo3hrQWWjEOFAoESJ5HrB0hs_=s96-c",
  "providerData": [
    {
      "providerId": "google.com",
      "uid": "151413121110987654321",
      "displayName": "jane doe",
      "email": "jane.doe@gmail.com",
      "phoneNumber": null,
      "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocJII3w4klFYX-YDFZtJo3hrQWWjEOFAoESJ5HrB0hs_=s96-c"
    }
  ],
  "stsTokenManager": {
    "refreshToken": "AMf-vBwPLMhkSHX9kDu_WjMpKQ2j1O5_ja4Mev_thmsbB1bo6xyTYvZeP2P3F-aU6vH3V5_kiEfJcuIq8wReF_mFzvxFr5KA8_chNBWVyS5loJxnO0uamK8kbZr_ZbK6youz6OE1KYzVo6yHKcUSUiEazy5quHQ2PofVoU3wB4HXLGa9aEeVzL-ulFs2uL3yxQOrak3hhjt3d1xFXg1fTaWo3gJAk7Z1WDOzmt3t6nd-lAZQ94sOJ2SlHHPgcrSFP8VZzdZn0di7J_W3LzNWtU25MsEgxPMx1h-bMqfGitvfp-kOvTjEjdChtIlCZccFOYoHPFQVl4T6o2BujLeKpnpOASmnzN7SeMXUSQOIrU4cGJu4XJccGMkMLHMWaLC35LcL12KUrt2TBwgdOsWNa7JlUFswcXTUQb0HonkPZtMFasYNAy9ndvo", "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjNiYjg3ZGNhM2JjYjY5ZDcyYjZjYmExYjU5YjMzY2M1MjI5N2NhOGQiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiYWFuaWthIHF1aW5uIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0pJSTN3NEZGbVlYLVlERlp0Sm8zaHJRV1dqRU9GQW9FU0o1SHJCMGhzXz1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9wcmVhY3R0ZXRyaXMiLCJhdWQiOiJwcmVhY3R0ZXRyaXMiLCJhdXRoX3RpbWUiOjE3MDkwNjQzNTcsInVzZXJfaWQiOiJESHJPSXJOWXpMT1lJS1NHWElpTUlsWlJzUEsyIiwic3ViIjoiREhyT0lyTll6TE9ZSUtTR1hJaU1JbFpSc1BLMiIsImlhdCI6MTcwOTA2NDM1NywiZXhwIjoxNzA5MDY3OTU3LCJlbWFpbCI6ImFhbmlrYS5xdWlubkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMzI5MjgwMDU0NzUwOTQ0NzgxOCJdLCJlbWFpbCI6WyJhYW5pa2EucXVpbm5AZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.qWwChHLY6NlNC5BtNHlD75I09YZbNkiRLds35JPzmt37WuvV0vevjEKw9Ax6qMtUrJ8T7P1dVDyMXdBLcWntALPGbmLH86EoKnXpd9bRrQvg-eu3OoK8rJMe1SqbSqHxSPTGZuc7wi9iQAPNWa3XlbWJZpdmY-cScruajXcKEmFd9K2QmlUcqmpBEe9t-OyoKXcqmHd_fU8nmuXb35d74uSlWldAABHZAUmaAOKQsagVkAj_RRK8CqQ0UyNHo8n391gEh0L2R3PQeb1TixuuMz_nEvbf5ebTdpuQ0dH5DY4xdgXsEIkegpIW1XN-1H4c9xZd7gANlLGKt7VyFWYM3g",
    "expirationTime": 1709067957841
  },
  "createdAt": "1709063972020",
  "lastLoginAt": "1709064326052",
  "apiKey": "AIzaSyA8JwDY65KIkmQlF-_8r4OfDCXHAOExf_8",
  "appName": "[DEFAULT]"
};
