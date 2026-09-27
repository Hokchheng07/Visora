import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useCurrentUser } from "./useCurrentUser";
import { useAddFavoriteMutation, useGetFavoritesQuery, useRemoveFavoriteMutation } from "../API/favoriteApi";

export function useFavorites() {
  const navigate = useNavigate();
  const { isSignedIn } = useCurrentUser();
  const list = useGetFavoritesQuery({ pageSize: 100 }, { skip: !isSignedIn });
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const favorites = useMemo(() => list.data?.data?.contents || [], [list.data]);
  const byTarget = useMemo(() => new Map(favorites.map((favorite) => [favorite.targetUuid, favorite])), [favorites]);

  const isFavorite = (targetUuid) => !!targetUuid && byTarget.has(targetUuid);

  const toggleFavorite = async (type, targetUuid) => {
    if (!targetUuid) return;
    if (!isSignedIn) {
      navigate("/auth/login");
      return;
    }
    const existing = byTarget.get(targetUuid);
    try {
      if (existing) {
        await removeFavorite({ favoriteUuid: existing.uuid }).unwrap();
      } else {
        await addFavorite({
          userFavoriteRequest: type === "TEMPLATE" ? { templateUuid: targetUuid } : { backdropUuid: targetUuid },
        }).unwrap();
      }
    } catch {
      window.alert(existing ? "Couldn't remove this favorite. Please try again." : "Couldn't add this favorite. Please try again.");
    }
  };

  const removeFavoriteByUuid = (favoriteUuid) => removeFavorite({ favoriteUuid }).unwrap()
    .catch(() => window.alert("Couldn't remove this favorite. Please try again."));

  return { favorites, isFavorite, toggleFavorite, removeFavoriteByUuid, isSignedIn, isLoading: list.isLoading, error: list.error, refetch: list.refetch };
}
