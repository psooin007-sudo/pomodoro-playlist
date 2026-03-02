import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <div className="size-full flex items-center justify-center bg-white">
      <div className="w-[390px] h-full">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}