'use client'

import React, { useEffect, useRef } from 'react';

/**
 * Renders the 3D poem animation hero section.
 *
 * IMPORTANT:
 * The animation structure should remain the same.
 *
 * The visual lighting has been changed to a warm cinematic
 * yellow / golden / amber lighting system.
 *
 * DO NOT use blue, cyan, teal or cool neon lighting.
 */
export const PoemAnimation = ({
    poemHTML,
    backgroundImageUrl,
    boyImageUrl
}: {
    poemHTML: string;
    backgroundImageUrl: string;
    boyImageUrl: string;
}) => {

    const contentRef = useRef<HTMLDivElement>(null);

    // Responsive scaling of the animation container.
    useEffect(() => {

        function adjustContentSize() {

            if (contentRef.current) {

                const viewportWidth = window.innerWidth;

                const baseWidth = 1000;

                const scaleFactor =
                    viewportWidth < baseWidth
                        ? (viewportWidth / baseWidth) * 0.9
                        : 1;

                contentRef.current.style.transform =
                    `scale(${scaleFactor})`;
            }
        }

        adjustContentSize();

        window.addEventListener(
            "resize",
            adjustContentSize
        );

        return () => {
            window.removeEventListener(
                "resize",
                adjustContentSize
            );
        };

    }, []);

    return (

        <header className="hero-section">

            {/* Background/subject/light sit OUTSIDE the fixed-size, scaled
                .content box below — that box's `transform: scale()` makes
                it the containing block for any `position: absolute`
                descendant regardless of the descendant's own position
                (a CSS spec quirk: any transform, not just position,
                creates a new containing block), which was clipping these
                to the box's fixed 1000×562 coordinate space instead of
                filling the viewport. They don't need that fixed coordinate
                system the way the cube's 3D transforms do, so they're
                rendered here instead, sized against .hero-section itself. */}
            <div className="animated hue"></div>

            <img
                className="backgroundImage"
                src={backgroundImageUrl}
                alt="Warm futuristic architectural environment"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
            />

            <img
                className="boyImage"
                src={boyImageUrl}
                alt="Subject"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
            />

            <div className="container">

                <div
                    ref={contentRef}
                    className="content"
                    style={{
                        display: 'block',
                        width: '1000px',
                        height: '562px'
                    }}
                >

                    <div className="container-full">

                        <div className="container">

                            <div className="cube">

                                <div className="face top"></div>

                                <div className="face bottom"></div>

                                <div
                                    className="face left text"
                                    dangerouslySetInnerHTML={{
                                        __html: poemHTML
                                    }}
                                />

                                <div
                                    className="face right text"
                                    dangerouslySetInnerHTML={{
                                        __html: poemHTML
                                    }}
                                />

                                <div className="face front"></div>

                                <div
                                    className="face back text"
                                    dangerouslySetInnerHTML={{
                                        __html: poemHTML
                                    }}
                                />

                            </div>

                        </div>

                        {/* REFLECTION */}

                        <div className="container-reflect">

                            <div className="cube">

                                <div className="face top"></div>

                                <div className="face bottom"></div>

                                <div
                                    className="face left text"
                                    dangerouslySetInnerHTML={{
                                        __html: poemHTML
                                    }}
                                />

                                <div
                                    className="face right text"
                                    dangerouslySetInnerHTML={{
                                        __html: poemHTML
                                    }}
                                />

                                <div className="face front"></div>

                                <div
                                    className="face back text"
                                    dangerouslySetInnerHTML={{
                                        __html: poemHTML
                                    }}
                                />

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </header>
    );
};
