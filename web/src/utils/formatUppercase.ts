// Función auxiliar para formatear texto
export const formatUppercase = (name: string) => {
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
