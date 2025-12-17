export interface LocationData {
  provinces: Province[];
}

export interface Province {
  name: string;
  municipalities: Municipality[];
}

export interface Municipality {
  name: string;
  neighborhoods: string[];
}

export const angolaLocations: LocationData = {
  provinces: [
    {
      name: "Bengo",
      municipalities: [
        { name: "Ambriz", neighborhoods: ["Centro", "Barra do Dande", "Tabi"] },
        { name: "Dande", neighborhoods: ["Caxito", "Mabubas", "Úcua"] },
        { name: "Nambuangongo", neighborhoods: ["Centro", "Quiage"] },
        { name: "Pango Aluquém", neighborhoods: ["Centro"] },
        { name: "Quiçama", neighborhoods: ["Muxima", "Demba Chio", "Quixinge"] }
      ]
    },
    {
      name: "Benguela",
      municipalities: [
        { name: "Balombo", neighborhoods: ["Centro", "Chindumbo"] },
        { name: "Baía Farta", neighborhoods: ["Centro", "Dombe Grande", "Equimina"] },
        { name: "Benguela", neighborhoods: ["Centro", "Cassange", "Lobito Velho", "Catumbela", "Praia Morena"] },
        { name: "Bocoio", neighborhoods: ["Centro", "Cubal do Lumbo"] },
        { name: "Caimbambo", neighborhoods: ["Centro", "Viela"] },
        { name: "Catumbela", neighborhoods: ["Centro", "Biópio", "Ganda"] },
        { name: "Chongorói", neighborhoods: ["Centro"] },
        { name: "Cubal", neighborhoods: ["Centro", "Tumbulo"] },
        { name: "Ganda", neighborhoods: ["Centro", "Babaera", "Chicuma"] },
        { name: "Lobito", neighborhoods: ["Centro", "Restinga", "Catumbela", "Compão", "Liro"] }
      ]
    },
    {
      name: "Bié",
      municipalities: [
        { name: "Andulo", neighborhoods: ["Centro", "Calucinga", "Cassumbe"] },
        { name: "Camacupa", neighborhoods: ["Centro", "Ringoma"] },
        { name: "Catabola", neighborhoods: ["Centro", "Chipeta"] },
        { name: "Chinguar", neighborhoods: ["Centro", "Cangote"] },
        { name: "Chitembo", neighborhoods: ["Centro"] },
        { name: "Cuemba", neighborhoods: ["Centro"] },
        { name: "Cunhinga", neighborhoods: ["Centro"] },
        { name: "Kuito", neighborhoods: ["Centro", "Kunje", "Trumba", "Cambândua", "Chinguar"] },
        { name: "Nharea", neighborhoods: ["Centro"] }
      ]
    },
    {
      name: "Cabinda",
      municipalities: [
        { name: "Belize", neighborhoods: ["Centro", "Luango"] },
        { name: "Buco-Zau", neighborhoods: ["Centro", "Necuto"] },
        { name: "Cabinda", neighborhoods: ["Centro", "Lândana", "Malembo", "Tando Zinze", "Lombo Lombo"] },
        { name: "Cacongo", neighborhoods: ["Centro", "Massabi", "Dinge"] }
      ]
    },
    {
      name: "Cuando Cubango",
      municipalities: [
        { name: "Calai", neighborhoods: ["Centro"] },
        { name: "Cuangar", neighborhoods: ["Centro"] },
        { name: "Cuchi", neighborhoods: ["Centro", "Cutato"] },
        { name: "Cuito Cuanavale", neighborhoods: ["Centro", "Baixo Longa", "Longa"] },
        { name: "Dirico", neighborhoods: ["Centro", "Mucusso"] },
        { name: "Mavinga", neighborhoods: ["Centro", "Luiana"] },
        { name: "Menongue", neighborhoods: ["Centro", "Caiundo", "Missombo"] },
        { name: "Rivungo", neighborhoods: ["Centro"] }
      ]
    },
    {
      name: "Cuanza Norte",
      municipalities: [
        { name: "Ambaca", neighborhoods: ["Centro", "Tango"] },
        { name: "Banga", neighborhoods: ["Centro"] },
        { name: "Bolongongo", neighborhoods: ["Centro"] },
        { name: "Cambambe", neighborhoods: ["Centro", "Massangano"] },
        { name: "Cazengo", neighborhoods: ["N'dalatando", "Centro", "Samba Lucala"] },
        { name: "Golungo Alto", neighborhoods: ["Centro", "Cambondo"] },
        { name: "Gonguembo", neighborhoods: ["Centro"] },
        { name: "Lucala", neighborhoods: ["Centro"] },
        { name: "Quiculungo", neighborhoods: ["Centro"] },
        { name: "Samba Caju", neighborhoods: ["Centro"] }
      ]
    },
    {
      name: "Cuanza Sul",
      municipalities: [
        { name: "Amboim", neighborhoods: ["Gabela", "Centro", "Assango"] },
        { name: "Cassongue", neighborhoods: ["Centro", "Dumbi"] },
        { name: "Cela", neighborhoods: ["Centro", "Waco Kungo"] },
        { name: "Conda", neighborhoods: ["Centro", "Cunjo"] },
        { name: "Ebo", neighborhoods: ["Centro"] },
        { name: "Libolo", neighborhoods: ["Calulo", "Centro", "Cabuta"] },
        { name: "Mussende", neighborhoods: ["Centro", "Quissongo"] },
        { name: "Porto Amboim", neighborhoods: ["Centro"] },
        { name: "Quibala", neighborhoods: ["Centro", "Cariango"] },
        { name: "Quilenda", neighborhoods: ["Centro"] },
        { name: "Seles", neighborhoods: ["Centro"] },
        { name: "Sumbe", neighborhoods: ["Centro", "Gungo", "Gangula"] }
      ]
    },
    {
      name: "Cunene",
      municipalities: [
        { name: "Cahama", neighborhoods: ["Centro", "Otchinjau"] },
        { name: "Cuanhama", neighborhoods: ["Ondjiva", "Centro", "Evale", "Môngua"] },
        { name: "Curoca", neighborhoods: ["Centro", "Oncócua"] },
        { name: "Cuvelai", neighborhoods: ["Centro"] },
        { name: "Namacunde", neighborhoods: ["Centro"] },
        { name: "Ombadja", neighborhoods: ["Centro", "Xangongo"] }
      ]
    },
    {
      name: "Huambo",
      municipalities: [
        { name: "Bailundo", neighborhoods: ["Centro", "Bimbe", "Lunge"] },
        { name: "Cachiungo", neighborhoods: ["Centro"] },
        { name: "Caála", neighborhoods: ["Centro", "Cuima", "Catata"] },
        { name: "Chinjenje", neighborhoods: ["Centro"] },
        { name: "Ecunha", neighborhoods: ["Centro"] },
        { name: "Huambo", neighborhoods: ["Centro", "Calima", "São Pedro", "Fátima", "São João", "Académica", "Benfica"] },
        { name: "Londuimbale", neighborhoods: ["Centro"] },
        { name: "Longonjo", neighborhoods: ["Centro", "Lepi"] },
        { name: "Mungo", neighborhoods: ["Centro"] },
        { name: "Ucuma", neighborhoods: ["Centro", "Alto Hama"] }
      ]
    },
    {
      name: "Huíla",
      municipalities: [
        { name: "Caconda", neighborhoods: ["Centro", "Gungue"] },
        { name: "Cacula", neighborhoods: ["Centro"] },
        { name: "Caluquembe", neighborhoods: ["Centro", "Ngola"] },
        { name: "Chiange", neighborhoods: ["Centro"] },
        { name: "Chibia", neighborhoods: ["Centro", "Jau", "Quihita"] },
        { name: "Chicomba", neighborhoods: ["Centro"] },
        { name: "Chipindo", neighborhoods: ["Centro", "Bambi"] },
        { name: "Cuvango", neighborhoods: ["Centro"] },
        { name: "Humpata", neighborhoods: ["Centro", "Palanca"] },
        { name: "Jamba", neighborhoods: ["Centro"] },
        { name: "Lubango", neighborhoods: ["Centro", "Quilemba", "Arimba", "Lucira", "Comercial", "João de Almeida"] },
        { name: "Matala", neighborhoods: ["Centro", "Capelongo"] },
        { name: "Quilengues", neighborhoods: ["Centro", "Impulo"] },
        { name: "Quipungo", neighborhoods: ["Centro"] }
      ]
    },
    {
      name: "Luanda",
      municipalities: [
        { name: "Belas", neighborhoods: ["Talatona", "Benfica", "Futungo de Belas", "Camama", "Kilamba Kiaxi", "Morro Bento"] },
        { name: "Cacuaco", neighborhoods: ["Centro", "Funda", "Kikolo", "Mulenvos", "Sequele"] },
        { name: "Cazenga", neighborhoods: ["Centro", "Tala Hady", "Hoji ya Henda", "11 de Novembro"] },
        { name: "Ícolo e Bengo", neighborhoods: ["Catete", "Centro", "Cassoneca"] },
        { name: "Kilamba Kiaxi", neighborhoods: ["Centro", "Palanca", "Golf", "Sapú"] },
        { name: "Luanda", neighborhoods: ["Ingombota", "Maianga", "Rangel", "Samba", "Sambizanga", "Marcal", "Maculusso", "Kinaxixe", "Mutamba", "Prenda"] },
        { name: "Quiçama", neighborhoods: ["Centro", "Muxima", "Demba Chio"] },
        { name: "Talatona", neighborhoods: ["Centro", "Camama", "Lar Patriota", "Benfica"] },
        { name: "Viana", neighborhoods: ["Centro", "Estalagem", "Zango", "Mulenvos", "Kikuxi", "Calumbo"] }
      ]
    },
    {
      name: "Lunda Norte",
      municipalities: [
        { name: "Cambulo", neighborhoods: ["Centro"] },
        { name: "Capenda Camulemba", neighborhoods: ["Centro"] },
        { name: "Caungula", neighborhoods: ["Centro"] },
        { name: "Chitato", neighborhoods: ["Centro", "Cuango"] },
        { name: "Cuango", neighborhoods: ["Centro", "Luremo"] },
        { name: "Cuílo", neighborhoods: ["Centro"] },
        { name: "Lubalo", neighborhoods: ["Centro"] },
        { name: "Lóvua", neighborhoods: ["Centro"] },
        { name: "Lucapa", neighborhoods: ["Centro", "Camissombo"] },
        { name: "Xá-Muteba", neighborhoods: ["Centro"] }
      ]
    },
    {
      name: "Lunda Sul",
      municipalities: [
        { name: "Cacolo", neighborhoods: ["Centro"] },
        { name: "Dala", neighborhoods: ["Centro"] },
        { name: "Muconda", neighborhoods: ["Centro", "Alto Chicapa"] },
        { name: "Saurimo", neighborhoods: ["Centro", "Sombo", "Txizainga"] }
      ]
    },
    {
      name: "Malanje",
      municipalities: [
        { name: "Cacuso", neighborhoods: ["Centro", "Pungo Andongo"] },
        { name: "Calandula", neighborhoods: ["Centro", "Quedas de Calandula"] },
        { name: "Cambundi-Catembo", neighborhoods: ["Centro"] },
        { name: "Cangandala", neighborhoods: ["Centro"] },
        { name: "Caombo", neighborhoods: ["Centro"] },
        { name: "Cuaba Nzogo", neighborhoods: ["Centro"] },
        { name: "Cunda-Dia-Baze", neighborhoods: ["Centro"] },
        { name: "Malanje", neighborhoods: ["Centro", "Cangambo", "Ngola Luíje", "Maxinde"] },
        { name: "Marimba", neighborhoods: ["Centro"] },
        { name: "Massango", neighborhoods: ["Centro"] },
        { name: "Mucari", neighborhoods: ["Centro"] },
        { name: "Quela", neighborhoods: ["Centro"] },
        { name: "Quirima", neighborhoods: ["Centro"] }
      ]
    },
    {
      name: "Moxico",
      municipalities: [
        { name: "Alto Zambeze", neighborhoods: ["Centro", "Cazombo"] },
        { name: "Bundas", neighborhoods: ["Centro"] },
        { name: "Camanongue", neighborhoods: ["Centro"] },
        { name: "Cameia", neighborhoods: ["Centro"] },
        { name: "Léua", neighborhoods: ["Centro"] },
        { name: "Luacano", neighborhoods: ["Centro"] },
        { name: "Luau", neighborhoods: ["Centro", "Teixeira de Sousa"] },
        { name: "Luchazes", neighborhoods: ["Centro"] },
        { name: "Moxico", neighborhoods: ["Luena", "Centro", "Lumeje"] }
      ]
    },
    {
      name: "Namibe",
      municipalities: [
        { name: "Bibala", neighborhoods: ["Centro", "Caitou", "Lola"] },
        { name: "Camucuio", neighborhoods: ["Centro"] },
        { name: "Namibe", neighborhoods: ["Centro", "Lucira", "Bentiaba"] },
        { name: "Tômbwa", neighborhoods: ["Centro", "Baía dos Tigres", "Iona"] },
        { name: "Virei", neighborhoods: ["Centro"] }
      ]
    },
    {
      name: "Uíge",
      municipalities: [
        { name: "Alto Cauale", neighborhoods: ["Centro"] },
        { name: "Ambuíla", neighborhoods: ["Centro"] },
        { name: "Bembe", neighborhoods: ["Centro"] },
        { name: "Buengas", neighborhoods: ["Centro"] },
        { name: "Bungo", neighborhoods: ["Centro"] },
        { name: "Damba", neighborhoods: ["Centro", "Maquela"] },
        { name: "Maquela do Zombo", neighborhoods: ["Centro", "Sacandica"] },
        { name: "Milunga", neighborhoods: ["Centro"] },
        { name: "Mucaba", neighborhoods: ["Centro"] },
        { name: "Negage", neighborhoods: ["Centro", "Dimuca"] },
        { name: "Puri", neighborhoods: ["Centro"] },
        { name: "Quimbele", neighborhoods: ["Centro"] },
        { name: "Quitexe", neighborhoods: ["Centro", "Aldeia Nova"] },
        { name: "Sanza Pombo", neighborhoods: ["Centro"] },
        { name: "Songo", neighborhoods: ["Centro"] },
        { name: "Uíge", neighborhoods: ["Centro", "Songo", "Quitexe"] },
        { name: "Zombo", neighborhoods: ["Centro"] }
      ]
    },
    {
      name: "Zaire",
      municipalities: [
        { name: "Cuimba", neighborhoods: ["Centro"] },
        { name: "M'banza-Kongo", neighborhoods: ["Centro", "Madimba", "Luvo"] },
        { name: "Nóqui", neighborhoods: ["Centro"] },
        { name: "N'zeto", neighborhoods: ["Centro", "Mbridge"] },
        { name: "Soyo", neighborhoods: ["Centro", "Mangue Grande", "Pedra do Feitiço"] },
        { name: "Tomboco", neighborhoods: ["Centro", "Quibocolo"] }
      ]
    }
  ]
};

export function getProvinces(): string[] {
  return angolaLocations.provinces.map(p => p.name);
}

export function getMunicipalities(provinceName: string): string[] {
  const province = angolaLocations.provinces.find(p => p.name === provinceName);
  return province ? province.municipalities.map(m => m.name) : [];
}

export function getNeighborhoods(provinceName: string, municipalityName: string): string[] {
  const province = angolaLocations.provinces.find(p => p.name === provinceName);
  if (!province) return [];
  const municipality = province.municipalities.find(m => m.name === municipalityName);
  return municipality ? municipality.neighborhoods : [];
}
