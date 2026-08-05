
import { Route } from "@/types/routes";
import { RouteActions } from "./RouteActions";
import { RouteStats } from "./RouteStats";
import { formatDateTime } from "./utils";

interface RouteListItemProps {
  route: Route;
  onPrint: (route: Route) => void;
  statusTranslations: Record<string, string>;
}

export const RouteListItem = ({ route, onPrint, statusTranslations }: RouteListItemProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border-none transition-all hover:shadow-md">
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold">{route.name}</h3>
            <p className="text-xs text-gray-500">
              {formatDateTime(route.start_time)}
            </p>
          </div>
          <RouteActions route={route} onPrint={onPrint} />
        </div>
        <RouteStats route={route} />
      </div>
    </div>
  );
};
