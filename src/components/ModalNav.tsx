import { Ref } from "preact";
import GoogleSignUp from "../GoogleSignUp";
import Profile from "../Profile";
import { useEffect, useRef } from "preact/hooks";
import { swapCssClass } from "../utils/AppUtil";

export const TYPE_PROFILE: string = "signin";
export const TYPE_SIGNIN: string = "profile";

type NavType = "signin" | "profile";

interface Props {
  type: NavType,
  show: boolean,
}
export default function ModalNav(props: Props) {
  const ref: Ref<HTMLDivElement> = useRef(null);

  useEffect(() => {
    const signInHandler = () => {
      console.log("Signed In With Google");
    };
    document.addEventListener("signInComplete", signInHandler);
    return () => {
      document.removeEventListener("signInComplete", signInHandler);
    }
  }, [])


  return (
    <div ref={ ref } className={ `modal-nav ${props.show ? 'show' : 'hide'}` }
      onAnimationStart={
        () => {
          if (props.show && ref.current) {
            ref.current.style.display = 'block';
          }
        }

      }
      onAnimationEnd={ (e: any) => {
        console.log("Animation End", e);
        if (!props.show && ref.current) {
          // ref.current.style.display = 'none';
        }
      } }>
      { props.type === TYPE_SIGNIN &&
        <GoogleSignUp callback={ (result) => {
          console.log(result);
          swapCssClass(ref.current, "show", "hide");
        } }></GoogleSignUp>
      }
      { props.type === TYPE_PROFILE &&
        <Profile></Profile>
      }
    </div>
  );
}
