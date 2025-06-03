import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Navbar from "../components/Navbar";

test("renders Navbar with expected links", () => {
  render(<Navbar />);
  expect(screen.getByText(/Home/i)).toBeInTheDocument();
  expect(screen.getByText(/Data Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Profile/i)).toBeInTheDocument();
});
