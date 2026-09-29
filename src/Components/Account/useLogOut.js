import { useNavigate } from "react-router";
import { useAppDispatch } from "../redux/hook.js";
import { setLogout } from "../redux/authslice";
import { baseApi } from "../API/baseApi";

/* Signs the account out everywhere a menu offers it: drops both tokens (and
   the stored refresh token), forgets cached account data so the next person
   starts clean, then leaves for the home page. */
export function useLogOut() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return () => {
    dispatch(setLogout());
    dispatch(baseApi.util.resetApiState());
    navigate("/", { replace: true });
  };
}
