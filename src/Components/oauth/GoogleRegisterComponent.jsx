import {
  GithubAuthProvider,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { auth } from "../Firebase/config.js";
import { toast } from "react-toastify";
import {
  useUserLoginMutation,
  useUserRegisterMutation,
} from "../API/authApi.js";
import { setAccessToken } from "../../Features/auth/AuthSlice.js";
import { profileApi } from "../API/profileApi.js";

// backend error shape is inconsistent — "description" is a plain string for
// simple errors (e.g. duplicate email) but an array of messages for
// validation errors (e.g. missing phoneNumber). Normalize both to a
// lowercase string so callers can safely call .includes() on it.
const getErrorMessage = (err) => {
  const description = err?.data?.error?.description;
  if (!description) return "";
  if (Array.isArray(description)) return description.join(" ").toLowerCase();
  if (typeof description === "string") return description.toLowerCase();
  return JSON.stringify(description).toLowerCase();
};

export const GithubRegisterComponent = () => {
  const [error, setError] = useState();
  const [pending, setIsPending] = useState(false);
  const [user, setUser] = useState(null);
  const provider = new GithubAuthProvider();
  provider.addScope("user:email");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [oauthRegister] = useUserRegisterMutation();
  const [userOauthLogin] = useUserLoginMutation();

  useEffect(() => {
    const unsubscriber = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscriber();
  }, []);

  const loginWithgithub = () => {
    setIsPending(true);
    // avoid IndexedDB persistence — it throws "Database is closing/hidden"
    // when the popup flow shifts document visibility mid-write
    setPersistence(auth, browserLocalPersistence)
      .then(() => signInWithPopup(auth, provider))
      .then((res) => {
        if (!res) {
          throw new Error("login unsuccessfully");
        }
        const githubUser = res.user;
        console.log("Github Info: ", githubUser.providerData[0]);

        const info = githubUser.providerData[0];
        if (!info.email) {
          throw new Error(
            "No public email on this Github account — make your email public on Github to register."
          );
        }
        const usernameSeed = (info.displayName || info.email).slice(0, 5);
        // Password must be deterministic per email and provider-independent —
        // if it were based on displayName, the same email registering via a
        // different provider (or a changed display name) would generate a
        // different password than what's already stored, and the
        // duplicate-email auto-login below would fail with "Bad credentials".
        // Suffix guarantees uppercase, lowercase, digit, and a special char.
        const passwordSeed = info.email.slice(0, 5);
        const password = `${passwordSeed}Ab1$2024`;

        return oauthRegister({
          userRegisterRequest: {
            username: usernameSeed,
            phoneNumber: info.phoneNumber,
            address: {
              addressLine1: "string",
              addressLine2: "string",
              road: "string",
              linkAddress: "string",
            },
            email: info.email,
            password,
            confirmPassword: password,
            profile: info.photoURL,
          },
        })
          .unwrap()
          .catch((registerError) => {
            const isDuplicateEmail =
              registerError?.status === 400 &&
              getErrorMessage(registerError).includes("already exist");

            if (isDuplicateEmail) {
              console.log("User already registered — proceeding to login");
              return null;
            }
            throw registerError;
          })
          .then((registerResult) => {
            console.log(`===> UserData: `, registerResult);

            if (registerResult?.accessToken) {
              dispatch(setAccessToken(registerResult.accessToken));
              if (registerResult.refreshToken) {
                sessionStorage.setItem(
                  "refreshToken",
                  registerResult.refreshToken
                );
              }
            }

            const isPreExistingAccount = registerResult === null;

            // registerResult is null when the email already existed —
            // fall through to login either way
            return userOauthLogin({
              userLoginRequest: { email: info.email, password },
            })
              .unwrap()
              .catch((loginError) => {
                if (isPreExistingAccount) {
                  // This account existed before this sign-in attempt, so we
                  // have no way of knowing its real stored password — bail
                  // out to the manual login page instead of dead-ending.
                  const redirect = new Error("redirect-to-login");
                  redirect.redirectToLogin = true;
                  redirect.email = info.email;
                  throw redirect;
                }
                throw loginError;
              });
          });
      })
      .then((loginResult) => {
        if (loginResult?.accessToken) {
          dispatch(setAccessToken(loginResult.accessToken));
          if (loginResult.refreshToken) {
            sessionStorage.setItem("refreshToken", loginResult.refreshToken);
          }
          dispatch(profileApi.endpoints.userProfile.initiate());
          toast.success("Signed in with Github!");
          navigate("/");
        } else {
          toast.error("Github sign-in failed — no access token received.");
        }
      })
      .catch((error) => {
        if (error?.redirectToLogin) {
          toast.info("This email is already registered — please log in.");
          navigate("/auth/login", { state: { email: error.email } });
          return;
        }
        setError(error);
        const message =
          getErrorMessage(error) || error?.message || "Github sign-in failed";
        toast.error(message);
        console.log(error);
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  const githubLogout = async () => {
    setIsPending(false);
    setError(null);
    try {
      await signOut(auth);
      setIsPending(true);
      console.log("Logout successfully!");
    } catch (error) {
      setError(error);
      console.log(error.message);
      setIsPending(false);
    }
  };

  return (
    <button
      className="w-full mt-4 border border-gray-300 py-2 rounded-lg flex items-center justify-center hover:bg-gray-100 transition"
      onClick={loginWithgithub}
    >
      <img
        src="https://www.svgrepo.com/show/394174/github.svg"
        alt="github"
        className="w-5 h-5 mr-2"
      />
      Register with Github
    </button>
  );
};
