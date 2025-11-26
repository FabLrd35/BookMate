"use client"

import { useEffect, useState, useRef } from "react"

export function HarryPotterAnimation() {
    const [snitchPos, setSnitchPos] = useState({ top: 0, left: 0 })
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Start animation after mount
        setIsVisible(true)

        const moveSnitch = () => {
            const h = window.innerHeight - 50
            const w = window.innerWidth - 50
            const nh = Math.floor(Math.random() * h)
            const nw = Math.floor(Math.random() * w)
            setSnitchPos({ top: nh, left: nw })
        }

        // Initial position
        moveSnitch()

        // Move every 1s
        const interval = setInterval(moveSnitch, 1000)

        return () => clearInterval(interval)
    }, [])

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden hp-wrapper">
            <div className="illu">
                <div className="besen">
                    <div className="besen__start"></div>
                    <div className="besen__end"></div>
                </div>

                <div className="body"></div>

                <div className="leg">
                    <div className="leg__top"></div>
                    <div className="leg__down">
                        <div className="foot"></div>
                    </div>
                </div>

                <div className="arm">
                    <div className="arm__top"></div>
                    <div className="arm__down"></div>
                </div>

                <div className="cap">
                    <div className="cap__main"></div>
                    <div className="cap__end"></div>
                </div>

                <div className="face--profil">
                    <div className="nose"></div>
                    <div className="base">
                        <div className="hair hair--right"></div>
                        <div className="hair hair--left"></div>
                        <div className="mouth"></div>
                        <div className="glases face--side"></div>
                        <div className="eye eye--right"></div>
                    </div>
                </div>
            </div>

            <div className="wind wind--1"></div>
            <div className="wind wind--2"></div>

            <div
                className="schnatz"
                style={{
                    top: `${snitchPos.top}px`,
                    left: `${snitchPos.left}px`,
                    transition: 'top 1s linear, left 1s linear'
                }}
            >
                <div className="kugel"></div>
                <div className="wing wing--left"></div>
                <div className="wing wing--right"></div>
            </div>

            <style jsx>{`
                /* Variables */
                .hp-wrapper {
                    --darkbrown: #7A4B2C;
                    --brown: #FAD08A;
                    --red: #C02E1A;
                    --bg: orange;
                    --white: #e5e5e5;
                    --brownmiddle: #B9832A;
                    --black: #49301B;
                }

                .illu {
                    position: absolute;
                    width: 60vw; /* Scaled down for overlay usage, originally 60vw */
                    height: 19vw;
                    animation: fly 2s linear infinite alternate;
                    transform-origin: left 30% center;
                    left: 10%; /* Position it */
                    top: 20%;
                    transform: scale(0.5); /* Scale down to be less intrusive */
                }

                @keyframes fly {
                    0% { transform: rotate(-5deg) scale(0.5); }
                    100% { transform: rotate(0deg) scale(0.5); }
                }

                /* Besen (Broom) */
                .besen {
                    position: absolute;
                    transform: rotate(-1deg);
                    bottom: 7vw;
                }
                .besen__start {
                    top: 3vw;
                    position: absolute;
                    width: 62vw;
                    height: 2vw;
                    background-color: var(--darkbrown);
                    border-radius: 30px;
                }
                .besen__end {
                    position: absolute;
                    background-color: var(--brown);
                    width: 20vw;
                    height: 8vw;
                    border-top-right-radius: 100px;
                    border-bottom-right-radius: 100px;
                }
                .besen__end:after {
                    position: absolute;
                    display: block;
                    content: "";
                    background-color: var(--red);
                    width: 1.5vw;
                    height: 8vw;
                    left: 14vw;
                }
                .besen__end:before {
                    position: absolute;
                    display: block;
                    content: "";
                    width: 0;
                    height: 0;
                    bottom: 2vw;
                    border-top: 1.5vw solid transparent;
                    border-left: 3vw solid var(--bg); /* Note: using bg color to mask */
                }

                /* Cap (Cape) */
                .cap {
                    position: relative;
                    left: 10vw;
                    top: -1vw;
                }
                .cap__main {
                    position: absolute;
                    background-color: var(--red);
                    width: 30vw;
                    height: 15vw;
                    border-top-right-radius: 2vw;
                    border-bottom-left-radius: 2vw;
                    border-bottom-right-radius: 100%;
                    animation: cap 1s linear infinite alternate;
                }
                @keyframes cap {
                    from {
                        border-bottom-left-radius: 2vw;
                        border-bottom-right-radius: 100%;
                    }
                    to {
                        border-bottom-left-radius: 6vw;
                        border-bottom-right-radius: 75%;
                    }
                }
                .cap__end {
                    position: absolute;
                    background-color: var(--red);
                    border-bottom-left-radius: 4vw;
                    width: 8vw;
                    left: -8vw;
                    height: 4vw;
                    top: 0;
                    animation: cap_end 1s linear infinite alternate;
                }
                @keyframes cap_end {
                    from {
                        border-top-left-radius: 2vw;
                        border-bottom-left-radius: 2vw;
                    }
                    to {
                        border-top-left-radius: 1.5vw;
                        border-bottom-left-radius: 1.5vw;
                    }
                }
                .cap__end:before {
                    position: absolute;
                    display: block;
                    content: "";
                    background-color: var(--red);
                    height: 4vw;
                    width: 4vw;
                    top: 4vw;
                    left: 4vw;
                }
                .cap__end:after {
                    position: absolute;
                    display: block;
                    content: "";
                    background-color: var(--bg); /* Masking with bg color might be tricky if overlay */
                    height: 4vw;
                    width: 4vw;
                    top: 4vw;
                    left: 4vw;
                    border-top-right-radius: 5vw;
                }

                /* Body */
                .body {
                    position: absolute;
                    background-color: var(--brownmiddle);
                    top: 2vw;
                    left: 21vw;
                    width: 21vw;
                    height: 12vw;
                    border-top-right-radius: 1vw;
                    border-bottom-right-radius: 100%;
                }

                /* Arm */
                .arm {
                    left: 37vw;
                    transform-origin: left center;
                    top: 2vw;
                    position: absolute;
                    animation: arm 2s linear infinite alternate;
                }
                @keyframes arm {
                    0% { transform: rotate(40deg); }
                    100% { transform: rotate(45deg); }
                }
                .arm__top {
                    position: absolute;
                    background-color: #C6512E;
                    border-radius: 40%;
                    width: 15vw;
                    height: 4vw;
                }
                .arm__down {
                    position: absolute;
                    left: 3vw;
                    bottom: -7vw;
                    transform-origin: right top;
                    background-color: #C6512E;
                    border-radius: 40%;
                    width: 10vw;
                    height: 3vw;
                    overflow: hidden;
                    animation: arm_down 2s linear infinite alternate;
                }
                @keyframes arm_down {
                    0% { transform: rotate(150deg); }
                    100% { transform: rotate(142deg); }
                }
                .arm__down:before {
                    position: absolute;
                    display: block;
                    content: "";
                    right: 0;
                    background-color: #C6512E;
                    height: 100%;
                    width: 70%;
                }
                .arm__down:after {
                    position: absolute;
                    display: block;
                    content: "";
                    background-color: beige;
                    position: absolute;
                    left: 0;
                    height: 100%;
                    width: 3vw;
                }

                /* Face Profile */
                .face--profil {
                    left: 37vw;
                    top: -8vw;
                    position: relative;
                    animation: face 2s -2s linear infinite alternate;
                }
                @keyframes face {
                    0% { transform: rotate(3deg); }
                    100% { transform: rotate(0deg); }
                }
                .nose {
                    position: absolute;
                    left: 9vw;
                    z-index: 5;
                    top: 6.3vw;
                    width: 1.5vw;
                    height: 1.5vw;
                    background-color: beige;
                    border-radius: 50%;
                }
                .base {
                    width: 10vw;
                    height: 11.5vw;
                    background-color: beige;
                    border-radius: 3vw;
                    border-bottom-left-radius: 6vw;
                    border-bottom-right-radius: 6vw;
                    position: relative;
                    overflow: hidden;
                }
                .eye {
                    background-color: #000;
                    height: 1vw;
                    width: 1vw;
                    position: absolute;
                    border-radius: 50%;
                    top: 5.5vw;
                }
                .eye--right {
                    right: 2vw;
                }
                .glases {
                    top: 5.7vw;
                    left: 9vw;
                    position: absolute;
                    width: 1.5vw;
                    height: 0.6vw;
                    background-color: black;
                }
                .glases:after {
                    position: absolute;
                    display: block;
                    content: "";
                    width: 3vw;
                    height: 3vw;
                    border-radius: 50%;
                    border: solid 0.6vw black;
                    top: -1.75vw;
                    left: -3.8vw;
                    z-index: 3;
                }
                .mouth {
                    background-color: var(--red);
                    width: 3vw;
                    height: 1vw;
                    position: absolute;
                    top: 9vw;
                    right: 0;
                    border-radius: 50% / 100%;
                    border-top-left-radius: 0;
                    border-top-right-radius: 0;
                }
                .hair {
                    background-color: var(--black);
                    position: absolute;
                    width: 52%;
                    height: 5vw;
                }
                .hair--right {
                    left: 0;
                    width: 40%;
                    height: 10vw;
                    border-top-left-radius: 2vw;
                    border-bottom-right-radius: 5vw;
                }
                .hair--left {
                    right: 0;
                    height: 3vw;
                    width: 100%;
                    border-top-right-radius: 2vw;
                    border-bottom-right-radius: 10%;
                }
                .hair--left:before {
                    position: absolute;
                    display: block;
                    content: "";
                    height: 2vw;
                    width: 2vw;
                    position: absolute;
                    background-color: var(--black);
                    top: 3vw;
                    left: 4vw;
                }
                .hair--left:after {
                    position: absolute;
                    display: block;
                    content: "";
                    height: 4vw;
                    width: 4vw;
                    background-color: beige;
                    top: 3vw;
                    left: 4vw;
                    border-radius: 50%;
                }

                /* Leg */
                .leg {
                    position: relative;
                    left: 20vw;
                    top: 9vw;
                    width: 22vw;
                    transform-origin: left top;
                    animation: leg 2s -2s linear infinite alternate;
                }
                @keyframes leg {
                    0% { transform: rotate(7deg); }
                    100% { transform: rotate(0deg); }
                }
                .leg__top {
                    position: absolute;
                    width: 22vw;
                    height: 6vw;
                    background-color: #C6512E;
                    border-radius: 40%;
                }
                .leg__down {
                    right: 0;
                    transform-origin: right center;
                    transform: rotate(-35deg);
                    position: absolute;
                    width: 18vw;
                    height: 5vw;
                    background-color: #C6512E;
                    border-radius: 40%;
                }
                .foot {
                    position: absolute;
                    background-color: var(--black);
                    width: 2vw;
                    height: 6vw;
                    top: 1vw;
                    left: -1vw;
                    transform-origin: left top;
                    border-bottom-right-radius: 80vw;
                    animation: foot 2s linear infinite alternate;
                }
                @keyframes foot {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(20deg); }
                }

                /* Wind */
                .wind {
                    animation: wind 1.5s linear infinite;
                    background-color: var(--white);
                    border-radius: 40px;
                    height: 1.5vh;
                    position: absolute;
                }
                .wind:after {
                    position: absolute;
                    display: block;
                    content: "";
                    position: absolute;
                    height: 1.5vh;
                    background-color: var(--white);
                    border-radius: 40px;
                    top: 4vw;
                    left: 8vw;
                }
                @keyframes wind {
                    from { transform: translateX(100vw); }
                    to { transform: translateX(-100vw); }
                }
                .wind--1 {
                    top: 10vh;
                    width: 30vw;
                }
                .wind--1:after {
                    width: 30vw;
                }
                .wind--2 {
                    bottom: 25vh;
                    width: 50vw;
                    animation-delay: -0.5s;
                }
                .wind--2:after {
                    width: 50vw;
                }

                /* Schnatz (Golden Snitch) */
                .schnatz {
                    position: absolute;
                    transition-timing-function: ease-in-out;
                }
                .kugel {
                    width: 3vw;
                    height: 3vw;
                    background-color: gold;
                    border-radius: 50%;
                    position: absolute;
                }
                .wing {
                    position: absolute;
                    width: 6vw;
                    height: 1.5vw;
                    border-radius: 20px;
                    background-color: gold;
                    top: -2vw;
                }
                .wing:after {
                    position: absolute;
                    display: block;
                    content: "";
                    position: absolute;
                    width: 4vw;
                    height: 1.5vw;
                    top: 1vw;
                    background-color: gold;
                    border-radius: 20px;
                }
                .wing--left {
                    left: -6vw;
                    transform-origin: right bottom;
                    animation: wing--left 1s infinite alternate;
                }
                @keyframes wing--left {
                    from { transform: rotate(30deg); }
                    to { transform: rotate(0deg); }
                }
                .wing--left:after {
                    left: 2vw;
                }
                .wing--right {
                    left: 3vw;
                    transform-origin: left bottom;
                    animation: wing--right 1s infinite alternate;
                }
                @keyframes wing--right {
                    from { transform: rotate(-30deg); }
                    to { transform: rotate(0deg); }
                }
            `}</style>
        </div>
    )
}
