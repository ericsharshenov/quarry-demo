import { DemoProvider } from "./DemoProvider";
import { PresenterBar } from "./PresenterBar";
import { RouteMap } from "./RouteMap";
import { OperatorDesk } from "./OperatorDesk";
import { DriverPhone } from "./DriverPhone";
import { LoaderTablet } from "./LoaderTablet";

export default function App() {
  return (
    <DemoProvider>
      <div className="app">
        <PresenterBar />
        <RouteMap />
        <main className="stage">
          <OperatorDesk />
          <DriverPhone />
          <LoaderTablet />
        </main>
      </div>
    </DemoProvider>
  );
}
