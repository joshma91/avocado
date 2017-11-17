import React from "react";
import styled from "styled-components";
import Link from "next/link";

const Title = styled.h1`
  color: red;
`;

const Homepage = () => (
  <div>
    <Title>Home Page</Title>
    <div><Link href="/find_teacher"><a>Find a Teacher</a></Link></div>
    <div><Link href="/teacher_onboarding"><a>Teacher Onboarding</a></Link></div>
    <div><Link href="/chat"><a>Chat</a></Link></div>
    <div><Link href="/example"><a>Example</a></Link></div>
  </div>
);

export default Homepage;
