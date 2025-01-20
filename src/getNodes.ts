/**
 * Retrieves all nodes to the base of the tree into a flat array
 * @param elem The base node
 * @returns 
 */
export function getAllChildNodes(elem: Node): Node[] {
    let ret: Node[] = [elem];
    if(elem.hasChildNodes()) {
        elem.childNodes.forEach((node: ChildNode) => {
            ret = ret.concat(getAllChildNodes(node));
        });
    }
    return ret;
}