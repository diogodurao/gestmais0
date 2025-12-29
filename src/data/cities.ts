export interface City {
    name: string;
    slug: string;
    district: string;
}

export const cities: City[] = [
    { name: "Lisboa", slug: "lisboa", district: "Lisboa" },
    { name: "Porto", slug: "porto", district: "Porto" },
    { name: "Vila Nova de Gaia", slug: "vila-nova-de-gaia", district: "Porto" },
    { name: "Amadora", slug: "amadora", district: "Lisboa" },
    { name: "Braga", slug: "braga", district: "Braga" },
    { name: "Funchal", slug: "funchal", district: "Madeira" },
    { name: "Coimbra", slug: "coimbra", district: "Coimbra" },
    { name: "Setúbal", slug: "setubal", district: "Setúbal" },
    { name: "Almada", slug: "almada", district: "Setúbal" },
    { name: "Aveiro", slug: "aveiro", district: "Aveiro" },
    { name: "Viseu", slug: "viseu", district: "Viseu" },
    { name: "Leiria", slug: "leiria", district: "Leiria" },
    { name: "Faro", slug: "faro", district: "Faro" },
    { name: "Évora", slug: "evora", district: "Évora" },
    { name: "Portimão", slug: "portimao", district: "Faro" },
    { name: "Cascais", slug: "cascais", district: "Lisboa" },
    { name: "Oeiras", slug: "oeiras", district: "Lisboa" },
    { name: "Sintra", slug: "sintra", district: "Lisboa" },
    { name: "Matosinhos", slug: "matosinhos", district: "Porto" },
    { name: "Loures", slug: "loures", district: "Lisboa" }
];
