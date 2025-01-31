import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import Highlight from "../src";
import { generateRandomHexString } from '../src/randomString';
import { getAllChildNodes } from '../src/getNodes';

describe('Replaces text with a span', () => {
    test('Single Match', () => {
        const dom = render(
            <Highlight query='test'>
                <div>hello test 123</div>
            </Highlight>
        );

        const field = dom.container.querySelector('span') as HTMLSpanElement | undefined;
        if(!field)
            fail('Span was not created');
        expect(field.firstChild?.textContent).toBe('test');
        const div = dom.container.querySelector('div') as HTMLDivElement | undefined;
        expect(div?.firstChild?.textContent).toBe('hello ');
        expect(div?.lastChild?.textContent).toBe(' 123');
    });

    test('Double Match', () => {
        const dom = render(
            <Highlight query='test'>
                <div>hello test 123 test</div>
            </Highlight>
        );

        const spans = dom.container.getElementsByTagName('span');
        expect(spans.length).toBe(2);
        for(let span of spans)
            expect(span.firstChild?.textContent).toBe('test');
        const div = dom.container.querySelector('div') as HTMLDivElement | undefined;
        expect(div?.firstChild?.textContent).toBe('hello ');
        expect(div?.lastChild?.previousSibling?.textContent).toBe(' 123 ');
    });
});

describe('Custom Style', () => {
    test('Blue text', () => {
        const dom = render(
            <Highlight query='test' style={{color: 'blue'}}>
                <div>hello test 123</div>
            </Highlight>
        );

        const span = dom.container.querySelector('span') as HTMLSpanElement | undefined;
        if(!span)
            fail('Span not created');
        expect(span.style.color).toBe('blue');
    });
});

describe('Random string', () => {
    test('Fail on negative length', () => {
        try {
            generateRandomHexString(-2);
            fail('String generated with negavtive length');
        } catch {

        }
    });
});

describe('Get nodes', () => {
    test('Null element returns empty array', () => {
        const res = getAllChildNodes(null!);
        expect(res.length).toBe(0);
    });
})