/* eslint-env jest */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

// Mock localStorage (optional if you're using token-based auth)
beforeEach(() => {
  Storage.prototype.getItem = jest.fn(() => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMjQwY2JhMGYtODRjMi00OTVkLWJjZWUtNzk0MDNhMjMzM2E0IiwidXNlcl9lbWFpbCI6InNob2xhQGdtYWlsLmNvbSIsInVzZXJfbmFtZSI6InNob2xhIn0sImlhdCI6MTc1MTY0NzU3MywiZXhwIjoxNzUxNjgzNTczfQ.t8f60A55BKwYliVHyvp-7HyPo-3VWPhf_c2gjB83C1M");
});

test("renders home page by default", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );

  expect(
    await screen.findByText(/Welcome to the Muslim Bulletin/i)
  ).toBeInTheDocument();
});
