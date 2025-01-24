import React from 'react';
import { useEffect, useRef, useMemo, useState } from 'react';
import { getAllChildNodes } from './getNodes';
import { generateRandomHexString } from './randomString';
import equal from 'deep-equal';

interface HighlightProps {
    /**
     * The children that need to have text highlighted
     */
    children: React.ReactNode,
    /**
     * The characters that are to be highlighted
     */
    query: string,
    /**
     * The highlight CSS style
     */
    style?: React.CSSProperties
}

/**
 * Generates the functions used in highlighting text and listening for DOM changes
 * @param query the character string to be highlighted in text
 * @param id a unique identifier that is used to managed what text has been highlighted
 * @param style the style to apply for highlighting
 * @returns An array of the functions
 */
function mutationCallbackFactory(query: string, id: string, style?: React.CSSProperties): [MutationCallback, (elem: Node) => void, (elem: Node) => void] {
    /**
     * Clears all the highlighting from a node
     * @param elem the element to clear highlighting from
     */
    function clearHighlight(elem: Node): void {
        if(elem.nodeType !== Node.TEXT_NODE)
            return;

        const parent = elem.parentNode as HTMLElement | null;
        if(!parent)
            return;

        if(elem.textContent === query)
            return;

        if (parent.classList.contains(id)) {
            if (parent.previousSibling?.nodeType === Node.TEXT_NODE) {
                parent.previousSibling.textContent = (parent.previousSibling?.textContent || '') + elem.textContent;
                if(parent.nextSibling && parent.nextSibling.nodeType === Node.TEXT_NODE) {
                    parent.previousSibling.textContent = (parent.previousSibling?.textContent || '') + parent.nextSibling.textContent;
                    parent.parentNode?.removeChild(parent.nextSibling);
                }
                parent.parentNode?.removeChild(parent);
            } else if (parent.nextSibling?.nodeType === Node.TEXT_NODE) {
                parent.nextSibling.textContent = elem.textContent + (parent.nextSibling?.textContent || '');
                parent.parentNode?.removeChild(parent);
            }
        }
    }

    /**
     * Highlights text on a node by inserting a span and slicing the text
     * @param elem the element to highlight text on
     */
    function highlight(elem: Node): void {
        if(!query)
            return;
        if (elem.nodeType === Node.TEXT_NODE && elem.textContent) {
            const parent = elem.parentNode as HTMLElement | null;
            if (!parent)
                return;
            
            const textContent = elem.textContent;
            let queryIndex = textContent.indexOf(query);
            // If the query isn't in the text, skip
            if (queryIndex === -1) {
                return;
            }

            // Check if the parent already contains the ID in its class list
            if (parent.classList.contains(id)) {
                return; // Skip if already highlighted
            }

            // Create a document fragment to preserve surrounding elements
            const fragment = document.createDocumentFragment();
            // Split the text into three parts
            let afterText = textContent.slice(queryIndex + query.length);
            let beforeText = textContent.slice(0, queryIndex);
            let queryText = textContent.slice(queryIndex, queryIndex + query.length);
            while(queryIndex !== -1) {
                // Add the text before the query, if any
                if (beforeText) {
                    fragment.appendChild(document.createTextNode(beforeText));
                }

                // Create a span for the query text
                const span = document.createElement('span');
                span.className = id;
                if (style) {
                    Object.assign(span.style, style);
                }
                span.textContent = queryText;
                fragment.appendChild(span);
                queryIndex = afterText.indexOf(query);
                if(queryIndex !== -1) {
                    beforeText = afterText.slice(0, queryIndex);
                    queryText = afterText.slice(queryIndex, queryIndex + query.length);
                    afterText = afterText.slice(queryIndex + query.length);
                }
            }

            // Add the text after the query, if any
            if (afterText) {
                fragment.appendChild(document.createTextNode(afterText));
            }

            // Replace the original text node with the fragment
            parent.replaceChild(fragment, elem);
        }
    }

    /**
     * The mutation callback for the DOM MutationObserver
     * @param mutationList the mutation list
     * @param observer the observer that is watching the DOM
     */
    function mutationCallback(mutationList: MutationRecord[], observer: MutationObserver) {
        mutationList.forEach((value: MutationRecord) => {
            let nodes = getAllChildNodes(value.target);
            nodes.forEach(clearHighlight);
            nodes = getAllChildNodes(value.target);
            nodes.forEach(highlight)
        });
    }

    return [mutationCallback, highlight, clearHighlight];
}

const defaultStyle: React.CSSProperties = {
    color: 'red'
};

const toKebabCase = (str: string) =>
    str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

/**
 * A wrapper that will highlight text in child elements
 * @param param0 the properties for the wrapper
 * @returns The component
 */
function Highlight({ children, query, style: _style = defaultStyle}: HighlightProps): React.ReactNode {
    const observer = useRef<MutationObserver>(null!);
    const id = useRef<string>(generateRandomHexString(8));
    const refs = useRef<Map<number, HTMLElement | null>>(new Map());
    const [style, setStyle] = useState<React.CSSProperties>(_style);

    useEffect(() => {
        if (!equal(style, _style)) {
            setStyle(_style);
            let nodes = document.getElementsByClassName(id.current);
            for(let node of nodes) {
                  Object.entries(_style).forEach(([key, value]) => {
                    if (value !== undefined) {
                        (node as HTMLSpanElement).style.setProperty(toKebabCase(key), String(value));
                    }
                  });
            }
        }
    }, [style, _style]);

    const [cb, highlight, clearHighlight] = useMemo(() => {
        return mutationCallbackFactory(query, id.current, style);
    }, [query, style]);

    useEffect(() => {
        observer.current = new MutationObserver(cb);
        refs.current.forEach((child: HTMLElement | null) => {
            if (child === null)
                return;
            else {
                let nodes = getAllChildNodes(child);
                nodes.forEach(clearHighlight);
                nodes = getAllChildNodes(child);
                nodes.forEach(highlight);
                observer.current.observe(child, { childList: true, subtree: true, characterData: true, characterDataOldValue: true });
            }
        }, []);
        return () => observer.current.disconnect();
    }, [query, style]);

    const childrenWithRefs = useMemo(() => React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
                ref: (el: HTMLElement) => {
                    refs.current.set(index, el);
                    let nodes = getAllChildNodes(el);
                    nodes.forEach(highlight);
                }
            });
        }
        return child;
    }), [children]);

    return (
        <>{childrenWithRefs}</>
    );
}

export default React.memo(Highlight);
