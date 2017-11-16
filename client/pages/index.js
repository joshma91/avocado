import React from "react";
import Link from "next/link";

const Homepage = () => (
  <div>
    <h1>Home Page</h1>
    <div><Link href="/find_teacher"><a>Find a Teacher</a></Link></div>
    <div><Link href="/teacher_onboarding"><a>Teacher Onboarding</a></Link></div>
    <div><Link href="/chat"><a>Chat</a></Link></div>
    <div><Link href="/example"><a>Example</a></Link></div>
  </div>
);

export default Homepage;
