import React from "react";
import TestQR from "../../components/Test/TestQR";
// import { sCount } from "./homeStore";

export default function Home() {
  // const count = sCount.use();

  // const handleClick = () => {
  //   sCount.set((n) => (n.value += 1));
  // };

  return (
    <div>
      <h1>Home</h1>
      {/* <button onClick={handleClick}>Up</button> */}
      <TestQR />
    </div>
  );
}
