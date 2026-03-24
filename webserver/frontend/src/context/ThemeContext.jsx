import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {

    const themes = [
        {name:"fallout4", display:"Fallout 4"},
        {name:"falloutnewvegas", display:"Fallout New Vegas"},
    ];

    const localRetro = localStorage.getItem('data-retro');
    const localScan = localStorage.getItem('data-scan');

    const [theme, setTheme] = useState(JSON.parse(localStorage.getItem('data-theme')) || themes[0]);
    const [retro, setRetro] = useState(localRetro !== null ? JSON.parse(localRetro) : true);
    const [scan, setScan] = useState(localScan !== null ? JSON.parse(localScan) : false);

    const toggleTheme = (num) => {
        const newtheme = themes[num];
        setTheme(newtheme);
        localStorage.setItem('data-theme', JSON.stringify(newtheme));
    };
    
    const toggleRetro = (state) => {
        setRetro(state);
        localStorage.setItem('data-retro', state);
    };

    const toggleScan = (state) => {
        setScan(state);
        localStorage.setItem('data-scan', state);
    };

    const getThemes = () => {
        return themes;
    };

    useEffect(() => {
      document.body.className = theme;
      //Tell DOM to update
      document.documentElement.setAttribute('data-theme', theme.name);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, retro, toggleRetro, getThemes, scan, toggleScan }}>
            {children}
        </ThemeContext.Provider>
    ); 

}
