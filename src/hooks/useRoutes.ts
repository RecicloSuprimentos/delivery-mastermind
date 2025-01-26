import { useRouteQuery } from "./routes/useRouteQuery";
import { useRouteMutations } from "./routes/useRouteMutations";

export const useRoutes = (routeId?: string) => {
  const { route, routeStops, isLoadingRoute } = useRouteQuery(routeId);
  const { saveRoute, updateRouteStatus } = useRouteMutations(routeId);

  return {
    route,
    routeStops,
    isLoadingRoute,
    saveRoute,
    updateRouteStatus,
  };
};