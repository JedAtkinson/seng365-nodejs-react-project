import axios from "axios";

const getGenres = (): Array<Genre> => {
    if (localStorage.getItem('genres')) return JSON.parse(localStorage.getItem('genres') as string)
    else return getGenresAxios()
}

const getAgeRatings = (): Array<string> => {
    return ['G', 'PG', 'M', 'R13', 'R16', 'R18', 'TBC']
}

const getGenresAxios = (): any => {
    axios.get('http://localhost:4941/api/v1/films/genres')
        .then((response) => {
            localStorage.setItem('genres', JSON.stringify(response.data))
            return(response.data)
        }, (error) => {
            return []
        })
}

const getUser = (): {token: string, userId: number} | null => {
    const user = sessionStorage.getItem('user')
    if (!user) return null
    return JSON.parse(user).token && JSON.parse(user).token ? JSON.parse(user) : null
}

const setUser = (user: {token: string, userId: number}) => {
    sessionStorage.setItem('user', JSON.stringify(user))
}

const removeUser = () => {
    sessionStorage.removeItem('user')
}

export {getGenres, getUser, setUser, getAgeRatings, removeUser};