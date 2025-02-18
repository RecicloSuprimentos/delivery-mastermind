
import { useRouteQuery } from "./routes/useRouteQuery";
import { useRouteMutations } from "./routes/useRouteMutations";

export const useRoutes = (routeId?: string) => {
  const { route } = useRouteQuery(routeId);
  const { saveRoute, updateRouteStatus } = useRouteMutations(routeId);

  return {
    route,
    saveRoute,
    updateRouteStatus,
  };
};
