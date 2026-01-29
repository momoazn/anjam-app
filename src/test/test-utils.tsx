/* eslint-disable react-refresh/only-export-components */
import { RenderOptions, render } from "@testing-library/react";
import { ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";

interface AllTheProvidersProps {
  children: React.ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

export * from "@testing-library/react";
export { customRender as render };
