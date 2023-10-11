import { HTMLElement } from 'node-html-parser'

/**
 * Gathers all tr elements and puts their children into a matrix.
 *
 * @param data The data to parse
 */
export function gatherElements(data: HTMLElement) {
    const elements: string[][] = []
    data.querySelectorAll('tr').forEach((element) => {
        // we only want children, so just the tds.
        const children = element.querySelectorAll('td')
        const childrenArray = []
        for (let i = 0; i < children.length; i++) {
            // sometimes the children text is nested in a <nobr> tag, already inside a <b> tag, we still want the text of that tag
            const child = children[i].innerText.trim()

            if (child.length === 0) {
                continue
            }

            // OBSCURE EDGE CASE
            if (i === 1 && childrenArray[0] === 'FIDE Title(s)') {
                // push as is
                childrenArray.push(child)
            } else {
                childrenArray.push(child.replaceAll('&nbsp;', ''))
            }
        }

        if (childrenArray.length > 0) {
            elements.push(childrenArray)
        }
    })

    return elements
}

/**
 * Finds an element on a page in the format of a matrix.
 * @param elements The elements
 * @param text The string to find in the first box
 * @param exact Whether or not to match the text exactly
 * @param key The key to return
 */
export function findElement(elements: string[][], text: string, exact: boolean = true, key: number = 1) {
    const element = elements.find(element => exact ? element[0] === text : element[0].includes(text))

    if (!element) {
        return null
    }

    return element[key]
}

/**
 * Converts what is usually a NAME (ID) format to { name: 'NAME', id: 'ID' }
 *
 * @param info The info to format
 */
export function nameAndIdFormatter(info: string) {
    // convert BRUH (ID) => { name: 'BRUH', id: 'ID' }
    const name = info.split(' (')[0]
    const id = info.split('(')[1].replace(')', '')

    return {
        name,
        id
    }
}
