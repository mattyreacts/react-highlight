# React Highlight
## Description
React Highlight is a versatile React component designed to make text highlighting seamless and dynamic in your application. Simply wrap your desired content with this component, and it will automatically highlight any matching text found within its child components.

### Key Features
* Customizable Highlighting Style <br />
You can define the exact style for the highlighted text using straightforward props, giving you full control over the appearance to match your application’s design.

* Dynamic Monitoring <br/>
The component actively observes changes in the DOM. If new text matching the search query is added or existing content is updated, the matching text will be highlighted automatically—no manual refresh or re-rendering required.

### Use Case Scenarios
* Enhancing search functionality by visually emphasizing matching results.
* Improving user accessibility by drawing attention to specific keywords or phrases in dynamic content.
* Supporting live updates, such as highlighting search terms in a chat application or updating results in real time as a user types.

## Example
```ts
"use client"
import Highlight from "../components";
import { useCallback, useState} from "react";
import { Stack, TextField } from '@mui/material';

export default function Home() {
    const [query, setQuery] = useState<string>('brown');
    const [text, setText] = useState<string>('The quick brown fox jumps over the lazy dog');
    const [style, setStyle] = useState<string>(JSON.stringify({color: 'blue'}));
    const [jsonStyle, setJsonStyle] = useState<React.CSSProperties>({
        color: 'blue'
    });

    const handleTextChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value);
    }, []);

    const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    }, []);

    const handleStyleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setStyle(event.target.value);
        try {
            let json = JSON.parse(event.target.value);
            setJsonStyle(json);
        } catch {}
    }, []);

    return (
        <Stack sx={{padding: theme => theme.spacing(1) }} spacing={1} alignItems="flex-start">
            <Highlight query={query} style={jsonStyle}>
                <Stack spacing={1}>
                    <div>
                        {text}
                    </div>
                    <p>
                        <span>brown fox jump</span>
                    </p>
                    <div>jumps</div>
                </Stack>
            </Highlight>
            <br />
            <br />
            <TextField variant="standard" onChange={handleTextChange} value={text} multiline sx={{minWidth: 400}} label="Text"/>
            <TextField variant="standard" onChange={handleQueryChange} value={query} label="Query" />
            <TextField variant="standard" onChange={handleStyleChange} value={style} label="Style" multiline/>
        </Stack>
    );
}
```
![Example](https://github.com/mattyreacts/publicimages/blob/98f74178dc05d0686ad145bf4d99f056d3a6880b/highlight-example.png "Example")

## Installation
```
npm install @mattyreacts/react-highlight
````

## Usage
Wrap all components that need to have text highlights in the component.

### Properties
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| query    | string | The string a characters to match and highlight in child components | - |
| style *(optional)* | JSON | The CSS JSON to style any matches found in the text | { color: 'red' } |

### How It Works
The wrapper processes all child elements to identify text nodes. When a text node contains text matching the specified query string, the wrapper modifies the DOM by replacing the matching text with a styled `<span>` element.

To ensure dynamic updates, the component leverages a `MutationObserver` to monitor changes within its child elements. If any modifications are detected in the DOM, the wrapper automatically re-executes the highlighting process. This includes removing any existing highlights, reevaluating the text content, and reapplying highlights as needed by replacing query matches with styled `<span>` elements.

For example, given the following child element and query string `"brown"`:
#### Original DOM
```html
<div>The quick brown fox jumps over the lazy dog</div>
```
#### Modified DOM
```html
<div>The quick <span class="abc738ef" style="color: red">brown</span> fox jumps over the lazy dog</div>
```
The wrapper assigns a randomly generated class name consisting of hexadecimal characters to each styled `<span>`. This ensures that the component can reliably identify and manage its modifications, allowing it to revert the DOM to its original state if the query string changes.

### Important Note
The wrapper does not filter by HTML element type. As a result, it may attempt to insert styled `<span>` elements into unintended locations, such as within buttons, input fields, or other interactive elements, if they contain matching text nodes. To avoid unexpected behavior, use this component carefully and ensure it is applied only to appropriate child elements.