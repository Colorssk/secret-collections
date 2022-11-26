import { useState } from "react";
import Navbar from './navbar.js';
import style from '../../styles/layout.module.css';
export default function Layout({ children }) {
    return (
      <>
        <Navbar />
        <div className={style.layoutContainer}>{children}</div>
      </>
    )
  }