import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

// Sample component for testing
function SampleComponent() {
  return <div>Hello, Testing!</div>;
}

test("renders SampleComponent with correct text", () => {
  render(<SampleComponent />);
  expect(screen.getByText("Hello, Testing!")).toBeInTheDocument();
});
