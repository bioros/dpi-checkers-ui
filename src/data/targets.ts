export type ProviderName =
  | "AWS"
  | "Google Cloud"
  | "Azure"
  | "Cloudflare"
  | "DigitalOcean"
  | "Hetzner"
  | "Vultr"
  | "Linode"
  | "OVHcloud"
  | "Oracle"
  | "Scaleway"
  | "Custom";

export interface Target {
  provider: ProviderName;
  region: string;
  label: string;
  url: string;
}

interface RegionDef {
  region: string;
  label: string;
}

function buildTargets(
  provider: ProviderName,
  regions: RegionDef[],
  urlTemplate: (region: string) => string
): Target[] {
  return regions.map((r) => ({
    provider,
    region: r.region,
    label: r.label,
    url: urlTemplate(r.region),
  }));
}

const awsTargets = buildTargets(
  "AWS",
  [
    { region: "us-east-1", label: "US East (N. Virginia)" },
    { region: "us-east-2", label: "US East (Ohio)" },
    { region: "us-west-1", label: "US West (N. California)" },
    { region: "us-west-2", label: "US West (Oregon)" },
    { region: "af-south-1", label: "Africa (Cape Town)" },
    { region: "ap-east-1", label: "Asia Pacific (Hong Kong)" },
    { region: "ap-south-1", label: "Asia Pacific (Mumbai)" },
    { region: "ap-south-2", label: "Asia Pacific (Hyderabad)" },
    { region: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
    { region: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
    { region: "ap-southeast-3", label: "Asia Pacific (Jakarta)" },
    { region: "ap-southeast-4", label: "Asia Pacific (Melbourne)" },
    { region: "ap-southeast-5", label: "Asia Pacific (Malaysia)" },
    { region: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
    { region: "ap-northeast-2", label: "Asia Pacific (Seoul)" },
    { region: "ap-northeast-3", label: "Asia Pacific (Osaka)" },
    { region: "ca-central-1", label: "Canada (Central)" },
    { region: "ca-west-1", label: "Canada (Calgary)" },
    { region: "eu-central-1", label: "Europe (Frankfurt)" },
    { region: "eu-central-2", label: "Europe (Zurich)" },
    { region: "eu-west-1", label: "Europe (Ireland)" },
    { region: "eu-west-2", label: "Europe (London)" },
    { region: "eu-west-3", label: "Europe (Paris)" },
    { region: "eu-south-1", label: "Europe (Milan)" },
    { region: "eu-south-2", label: "Europe (Spain)" },
    { region: "eu-north-1", label: "Europe (Stockholm)" },
    { region: "me-south-1", label: "Middle East (Bahrain)" },
    { region: "me-central-1", label: "Middle East (UAE)" },
    { region: "sa-east-1", label: "South America (São Paulo)" },
    { region: "il-central-1", label: "Israel (Tel Aviv)" },
    { region: "us-gov-west-1", label: "GovCloud (US-West)" },
    { region: "us-gov-east-1", label: "GovCloud (US-East)" },
  ],
  (r) => `https://s3.${r}.amazonaws.com/`
);

const gcpTargets = buildTargets(
  "Google Cloud",
  [
    { region: "us-central1", label: "Iowa" },
    { region: "us-east1", label: "South Carolina" },
    { region: "us-east4", label: "N. Virginia" },
    { region: "us-east5", label: "Columbus" },
    { region: "us-south1", label: "Dallas" },
    { region: "us-west1", label: "Oregon" },
    { region: "us-west2", label: "Los Angeles" },
    { region: "us-west3", label: "Salt Lake City" },
    { region: "us-west4", label: "Las Vegas" },
    { region: "northamerica-northeast1", label: "Montréal" },
    { region: "northamerica-northeast2", label: "Toronto" },
    { region: "southamerica-east1", label: "São Paulo" },
    { region: "southamerica-west1", label: "Santiago" },
    { region: "europe-central2", label: "Warsaw" },
    { region: "europe-north1", label: "Finland" },
    { region: "europe-southwest1", label: "Madrid" },
    { region: "europe-west1", label: "Belgium" },
    { region: "europe-west2", label: "London" },
    { region: "europe-west3", label: "Frankfurt" },
    { region: "europe-west4", label: "Netherlands" },
    { region: "europe-west6", label: "Zurich" },
    { region: "europe-west8", label: "Milan" },
    { region: "europe-west9", label: "Paris" },
    { region: "europe-west10", label: "Berlin" },
    { region: "europe-west12", label: "Turin" },
    { region: "asia-east1", label: "Taiwan" },
    { region: "asia-east2", label: "Hong Kong" },
    { region: "asia-northeast1", label: "Tokyo" },
    { region: "asia-northeast2", label: "Osaka" },
    { region: "asia-northeast3", label: "Seoul" },
    { region: "asia-south1", label: "Mumbai" },
    { region: "asia-south2", label: "Delhi" },
    { region: "asia-southeast1", label: "Singapore" },
    { region: "asia-southeast2", label: "Jakarta" },
    { region: "australia-southeast1", label: "Sydney" },
    { region: "australia-southeast2", label: "Melbourne" },
    { region: "me-central1", label: "Doha" },
    { region: "me-central2", label: "Dammam" },
    { region: "me-west1", label: "Tel Aviv" },
    { region: "africa-south1", label: "Johannesburg" },
  ],
  (r) => `https://${r}-storage.googleapis.com/`
);

const azureTargets = buildTargets(
  "Azure",
  [
    { region: "eastus", label: "East US (Virginia)" },
    { region: "eastus2", label: "East US 2 (Virginia)" },
    { region: "centralus", label: "Central US (Iowa)" },
    { region: "northcentralus", label: "North Central US (Illinois)" },
    { region: "southcentralus", label: "South Central US (Texas)" },
    { region: "westcentralus", label: "West Central US (Wyoming)" },
    { region: "westus", label: "West US (California)" },
    { region: "westus2", label: "West US 2 (Washington)" },
    { region: "westus3", label: "West US 3 (Arizona)" },
    { region: "canadacentral", label: "Canada Central (Toronto)" },
    { region: "canadaeast", label: "Canada East (Quebec)" },
    { region: "brazilsouth", label: "Brazil South (São Paulo)" },
    { region: "northeurope", label: "North Europe (Ireland)" },
    { region: "westeurope", label: "West Europe (Netherlands)" },
    { region: "uksouth", label: "UK South (London)" },
    { region: "ukwest", label: "UK West (Cardiff)" },
    { region: "francecentral", label: "France Central (Paris)" },
    { region: "francesouth", label: "France South (Marseille)" },
    { region: "switzerlandnorth", label: "Switzerland North (Zurich)" },
    { region: "switzerlandwest", label: "Switzerland West (Geneva)" },
    { region: "germanywestcentral", label: "Germany West Central (Frankfurt)" },
    { region: "germanynorth", label: "Germany North (Berlin)" },
    { region: "norwayeast", label: "Norway East (Oslo)" },
    { region: "norwaywest", label: "Norway West (Stavanger)" },
    { region: "swedencentral", label: "Sweden Central (Gävle)" },
    { region: "swedensouth", label: "Sweden South (Malmö)" },
    { region: "polandcentral", label: "Poland Central (Warsaw)" },
    { region: "italynorth", label: "Italy North (Milan)" },
    { region: "spaincentral", label: "Spain Central (Madrid)" },
    { region: "southafricanorth", label: "South Africa North (Johannesburg)" },
    { region: "southafricawest", label: "South Africa West (Cape Town)" },
    { region: "uaenorth", label: "UAE North (Dubai)" },
    { region: "uaecentral", label: "UAE Central (Abu Dhabi)" },
    { region: "qatarcentral", label: "Qatar Central (Doha)" },
    { region: "israelcentral", label: "Israel Central (Tel Aviv)" },
    { region: "eastasia", label: "East Asia (Hong Kong)" },
    { region: "southeastasia", label: "Southeast Asia (Singapore)" },
    { region: "japaneast", label: "Japan East (Tokyo)" },
    { region: "japanwest", label: "Japan West (Osaka)" },
    { region: "koreacentral", label: "Korea Central (Seoul)" },
    { region: "koreasouth", label: "Korea South (Busan)" },
    { region: "centralindia", label: "Central India (Pune)" },
    { region: "southindia", label: "South India (Chennai)" },
    { region: "westindia", label: "West India (Mumbai)" },
    { region: "australiaeast", label: "Australia East (Sydney)" },
    { region: "australiasoutheast", label: "Australia SE (Melbourne)" },
    { region: "australiacentral", label: "Australia Central (Canberra)" },
    { region: "mexicocentral", label: "Mexico Central" },
    { region: "newzealandnorth", label: "New Zealand North (Auckland)" },
  ],
  (r) => `https://${r}.blob.core.windows.net/`
);

const cfTargets: Target[] = buildTargets(
  "Cloudflare",
  [
    { region: "wnam", label: "Western North America" },
    { region: "enam", label: "Eastern North America" },
    { region: "weur", label: "Western Europe" },
    { region: "eeur", label: "Eastern Europe" },
    { region: "apac", label: "Asia Pacific" },
    { region: "auto", label: "Auto (Global Anycast)" },
  ],
  (r) => `https://cloudflare-${r}.r2.cloudflarestorage.com/`
);
cfTargets.push(
  { provider: "Cloudflare", region: "global-workers", label: "Workers (Global)", url: "https://workers.cloudflare.com/" },
  { provider: "Cloudflare", region: "global-cdn", label: "CDN (cdnjs)", url: "https://cdnjs.cloudflare.com/" },
  { provider: "Cloudflare", region: "global-api", label: "API Endpoint", url: "https://api.cloudflare.com/" },
  { provider: "Cloudflare", region: "1.1.1.1", label: "DNS (1.1.1.1)", url: "https://1.1.1.1/cdn-cgi/trace" },
);

const doTargets = buildTargets(
  "DigitalOcean",
  [
    { region: "nyc3", label: "New York 3" },
    { region: "ams3", label: "Amsterdam 3" },
    { region: "sgp1", label: "Singapore 1" },
    { region: "sfo2", label: "San Francisco 2" },
    { region: "sfo3", label: "San Francisco 3" },
    { region: "fra1", label: "Frankfurt 1" },
    { region: "lon1", label: "London 1" },
    { region: "tor1", label: "Toronto 1" },
    { region: "blr1", label: "Bangalore 1" },
    { region: "syd1", label: "Sydney 1" },
  ],
  (r) => `https://${r}.digitaloceanspaces.com/`
);

const hetznerTargets: Target[] = buildTargets(
  "Hetzner",
  [
    { region: "fsn1", label: "Falkenstein (Germany)" },
    { region: "nbg1", label: "Nuremberg (Germany)" },
    { region: "hel1", label: "Helsinki (Finland)" },
    { region: "ash", label: "Ashburn (US East)" },
    { region: "hil", label: "Hillsboro (US West)" },
    { region: "sin", label: "Singapore" },
  ],
  (r) => `https://${r}.your-objectstorage.com/`
);
hetznerTargets.push(
  { provider: "Hetzner", region: "api", label: "Hetzner Cloud API", url: "https://api.hetzner.cloud/" },
  { provider: "Hetzner", region: "robot-api", label: "Robot API (Dedicated)", url: "https://robot-ws.your-server.de/" },
);

const vultrTargets = buildTargets(
  "Vultr",
  [
    { region: "ewr", label: "New Jersey" },
    { region: "ord", label: "Chicago" },
    { region: "dfw", label: "Dallas" },
    { region: "atl", label: "Atlanta" },
    { region: "mia", label: "Miami" },
    { region: "lax", label: "Los Angeles" },
    { region: "sjc", label: "Silicon Valley" },
    { region: "sea", label: "Seattle" },
    { region: "hon", label: "Honolulu" },
    { region: "yto", label: "Toronto" },
    { region: "cdg", label: "Paris" },
    { region: "fra", label: "Frankfurt" },
    { region: "ams", label: "Amsterdam" },
    { region: "lhr", label: "London" },
    { region: "waw", label: "Warsaw" },
    { region: "mad", label: "Madrid" },
    { region: "sto", label: "Stockholm" },
    { region: "nrt", label: "Tokyo" },
    { region: "icn", label: "Seoul" },
    { region: "sgp", label: "Singapore" },
    { region: "bom", label: "Mumbai" },
    { region: "del", label: "Delhi" },
    { region: "blr", label: "Bangalore" },
    { region: "syd", label: "Sydney" },
    { region: "mel", label: "Melbourne" },
    { region: "jnb", label: "Johannesburg" },
    { region: "sao", label: "São Paulo" },
    { region: "mex", label: "Mexico City" },
    { region: "scl", label: "Santiago" },
    { region: "tlv", label: "Tel Aviv" },
  ],
  (r) => `https://${r}1.vultrobjects.com/`
);

const linodeTargets = buildTargets(
  "Linode",
  [
    { region: "us-east", label: "Newark, NJ" },
    { region: "us-central", label: "Dallas, TX" },
    { region: "us-west", label: "Fremont, CA" },
    { region: "us-lax", label: "Los Angeles, CA" },
    { region: "us-mia", label: "Miami, FL" },
    { region: "us-ord", label: "Chicago, IL" },
    { region: "us-sea", label: "Seattle, WA" },
    { region: "ca-central", label: "Toronto, Canada" },
    { region: "eu-west", label: "London, UK" },
    { region: "eu-central", label: "Frankfurt, Germany" },
    { region: "eu-south", label: "Milan, Italy" },
    { region: "ap-west", label: "Mumbai, India" },
    { region: "ap-south", label: "Singapore" },
    { region: "ap-southeast", label: "Sydney, Australia" },
    { region: "ap-northeast", label: "Tokyo, Japan" },
    { region: "ap-northeast-2", label: "Osaka, Japan" },
    { region: "id-cgk", label: "Jakarta, Indonesia" },
    { region: "br-gru", label: "São Paulo, Brazil" },
    { region: "nl-ams", label: "Amsterdam, Netherlands" },
    { region: "se-sto", label: "Stockholm, Sweden" },
    { region: "es-mad", label: "Madrid, Spain" },
    { region: "in-maa", label: "Chennai, India" },
    { region: "fr-par", label: "Paris, France" },
  ],
  (r) => `https://${r}.linodeobjects.com/`
);

const ovhTargets = buildTargets(
  "OVHcloud",
  [
    { region: "gra", label: "Gravelines (France)" },
    { region: "sbg", label: "Strasbourg (France)" },
    { region: "rbx", label: "Roubaix (France)" },
    { region: "de1", label: "Frankfurt (Germany)" },
    { region: "uk1", label: "London (UK)" },
    { region: "waw1", label: "Warsaw (Poland)" },
    { region: "bhs", label: "Beauharnois (Canada)" },
    { region: "sgp1", label: "Singapore" },
    { region: "syd1", label: "Sydney (Australia)" },
  ],
  (r) => `https://s3.${r}.cloud.ovh.net/`
);

const oracleTargets = buildTargets(
  "Oracle",
  [
    { region: "us-ashburn-1", label: "US East (Ashburn)" },
    { region: "us-phoenix-1", label: "US West (Phoenix)" },
    { region: "us-sanjose-1", label: "US West (San Jose)" },
    { region: "us-chicago-1", label: "US Central (Chicago)" },
    { region: "ca-toronto-1", label: "Canada SE (Toronto)" },
    { region: "ca-montreal-1", label: "Canada SE (Montreal)" },
    { region: "sa-saopaulo-1", label: "Brazil East (São Paulo)" },
    { region: "sa-vinhedo-1", label: "Brazil SE (Vinhedo)" },
    { region: "sa-santiago-1", label: "Chile (Santiago)" },
    { region: "sa-bogota-1", label: "Colombia (Bogota)" },
    { region: "mx-queretaro-1", label: "Mexico (Queretaro)" },
    { region: "mx-monterrey-1", label: "Mexico (Monterrey)" },
    { region: "eu-frankfurt-1", label: "Germany (Frankfurt)" },
    { region: "eu-amsterdam-1", label: "Netherlands (Amsterdam)" },
    { region: "eu-zurich-1", label: "Switzerland (Zurich)" },
    { region: "eu-madrid-1", label: "Spain (Madrid)" },
    { region: "eu-marseille-1", label: "France (Marseille)" },
    { region: "eu-milan-1", label: "Italy (Milan)" },
    { region: "eu-stockholm-1", label: "Sweden (Stockholm)" },
    { region: "eu-paris-1", label: "France (Paris)" },
    { region: "uk-london-1", label: "UK (London)" },
    { region: "uk-cardiff-1", label: "UK (Cardiff)" },
    { region: "me-jeddah-1", label: "Saudi Arabia (Jeddah)" },
    { region: "me-dubai-1", label: "UAE (Dubai)" },
    { region: "me-abudhabi-1", label: "UAE (Abu Dhabi)" },
    { region: "af-johannesburg-1", label: "South Africa (Johannesburg)" },
    { region: "ap-tokyo-1", label: "Japan (Tokyo)" },
    { region: "ap-osaka-1", label: "Japan (Osaka)" },
    { region: "ap-seoul-1", label: "South Korea (Seoul)" },
    { region: "ap-chuncheon-1", label: "South Korea (Chuncheon)" },
    { region: "ap-mumbai-1", label: "India (Mumbai)" },
    { region: "ap-hyderabad-1", label: "India (Hyderabad)" },
    { region: "ap-singapore-1", label: "Singapore" },
    { region: "ap-sydney-1", label: "Australia (Sydney)" },
    { region: "ap-melbourne-1", label: "Australia (Melbourne)" },
    { region: "il-jerusalem-1", label: "Israel (Jerusalem)" },
  ],
  (r) => `https://objectstorage.${r}.oraclecloud.com/n/`
);

const scalewayTargets = buildTargets(
  "Scaleway",
  [
    { region: "fr-par", label: "Paris (France)" },
    { region: "nl-ams", label: "Amsterdam (Netherlands)" },
    { region: "pl-waw", label: "Warsaw (Poland)" },
  ],
  (r) => `https://s3.${r}.scw.cloud/`
);

export const ALL_TARGETS: Target[] = [
  ...awsTargets,
  ...gcpTargets,
  ...azureTargets,
  ...cfTargets,
  ...doTargets,
  ...hetznerTargets,
  ...vultrTargets,
  ...linodeTargets,
  ...ovhTargets,
  ...oracleTargets,
  ...scalewayTargets,
];

export const PROVIDER_NAMES: ProviderName[] = [
  "AWS",
  "Google Cloud",
  "Azure",
  "Cloudflare",
  "DigitalOcean",
  "Hetzner",
  "Vultr",
  "Linode",
  "OVHcloud",
  "Oracle",
  "Scaleway",
];

export const PROVIDER_COLORS: Record<string, string> = {
  AWS: "#FF9900",
  "Google Cloud": "#4285F4",
  Azure: "#0078D4",
  Cloudflare: "#F48120",
  DigitalOcean: "#0080FF",
  Hetzner: "#D50C2D",
  Vultr: "#007BFC",
  Linode: "#00B050",
  OVHcloud: "#123F6D",
  Oracle: "#F80000",
  Scaleway: "#4F0599",
  Custom: "#6B7280",
};

export const PROVIDER_ICONS: Record<string, string> = {
  AWS: "☁",
  "Google Cloud": "🔷",
  Azure: "🔵",
  Cloudflare: "🔶",
  DigitalOcean: "🌊",
  Hetzner: "🔴",
  Vultr: "🟦",
  Linode: "🟢",
  OVHcloud: "🏢",
  Oracle: "🔻",
  Scaleway: "🟣",
  Custom: "🔧",
};
