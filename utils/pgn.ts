// PGN Creation Utils

export function buildDate() {
    // date is formatted as YYYY.MM.DD
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // month is 0-indexed
    const day = date.getDate()
    return `${year}.${month}.${day}`
}

export const results = [{
    title: '*',
    subtitle: 'No Result'
}, {
    title: '1-0',
    subtitle: 'White Wins'
}, {
    title: '0-1',
    subtitle: 'Black Wins'
}, {
    title: '1/2-1/2',
    subtitle: 'Draw'
}]

export function resultProps(item: Record<string, string>): Record<string, string> {
    return {
        title: item.title,
        subtitle: item.subtitle
    }
}
