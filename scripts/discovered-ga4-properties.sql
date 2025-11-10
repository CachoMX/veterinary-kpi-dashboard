-- Auto-discovered GA4 Properties
-- Generated: 2025-10-29T16:54:20.442816
-- Total: 382 properties

-- Clear existing data (comment out if you want to keep existing)
-- DELETE FROM ga4_properties;

-- Insert discovered properties

-- A Pets Farewell - apetsfarewell.com (VMP)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('apetsfarewell.com', '356975619', 'A Pets Farewell - apetsfarewell.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Animal medical center - animalmedicalcenterofchicago.com (VMP)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('animalmedicalcenterofchicago.com', '386756550', 'Animal medical center - animalmedicalcenterofchicago.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Cypress Animal Lake Hospital - cypresslakeanimalhospitalfortmyers.com (VMP)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('cypresslakeanimalhospitalfortmyers.com', '416418979', 'Cypress Animal Lake Hospital - cypresslakeanimalhospitalfortmyers.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- All Pet Center / South Arkansas Emergency Veterinary Service - hotspringsvillagevet.com (VMP)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('hotspringsvillagevet.com', '416414262', 'All Pet Center / South Arkansas Emergency Veterinary Service - hotspringsvillagevet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Crossroads Pet Hospital - crossroadspethospital.com (VMP)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('crossroadspethospital.com', '416414905', 'Crossroads Pet Hospital - crossroadspethospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Finding My Paws - findingmypaws.com (VMP)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('findingmypaws.com', '416515694', 'Finding My Paws - findingmypaws.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- dp-connec (Pet Home Euthanasia)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dp-connec', '379187873', 'dp-connec', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Morristown - easyvet.com/location/veterinarian-morristown-tn (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('morristown.easyvet.com', '261765020', 'easyvet Morristown - easyvet.com/location/veterinarian-morristown-tn', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Allen - easyvet.com/location/veterinarian-allen-tx (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('allen.easyvet.com', '261758104', 'easyvet Allen - easyvet.com/location/veterinarian-allen-tx', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Madison - easyvet.com/location/veterinarian-madison-al (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('madison.easyvet.com', '261784805', 'easyvet Madison - easyvet.com/location/veterinarian-madison-al', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Goodyear - easyvet.com/location/veterinarian-goodyear-az (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('goodyear.easyvet.com', '281736959', 'easyvet Goodyear - easyvet.com/location/veterinarian-goodyear-az', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Vestavia Hills AL - easyvet.com/location/veterinarian-liberty-park-al/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('libertypark.easyvet.com', '284633494', 'easyvet Vestavia Hills AL - easyvet.com/location/veterinarian-liberty-park-al/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Greater Chattanooga - easyvet.com/location/veterinarian-ooltewah-tn/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('greaterchattanooga.easyvet.com', '285192770', 'easyvet Greater Chattanooga - easyvet.com/location/veterinarian-ooltewah-tn/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet San Tan Valley - easyvet.com/location/veterinarian-queen-creek-az/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('santanvalley.easyvet.com', '285150119', 'easyvet San Tan Valley - easyvet.com/location/veterinarian-queen-creek-az/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Midlothian - easyvet.com/location/veterinarian-midlothian-va/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('midlothian.easyvet.com', '285192505', 'easyvet Midlothian - easyvet.com/location/veterinarian-midlothian-va/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Easyvet1 - easyvet.com (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('easyvet.com', '285182029', 'Easyvet1 - easyvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Alpharetta - easyvet.com/location/veterinarian-alpharetta-ga/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('alpharetta.easyvet.com', '285212605', 'easyvet Alpharetta - easyvet.com/location/veterinarian-alpharetta-ga/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Overland park - easyvet.com/location/veterinarian-overland-park-ks/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('overlandpark.easyvet.com', '285195407', 'easyvet Overland park - easyvet.com/location/veterinarian-overland-park-ks/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Frisco - easyvet.com/location/veterinarian-frisco-tx/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('frisco.easyvet.com', '285192005', 'easyvet Frisco - easyvet.com/location/veterinarian-frisco-tx/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Knoxville - easyvet.com/location/veterinarian-knoxville-tn/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('easyvet.com', '294231382', 'easyvet Knoxville - easyvet.com/location/veterinarian-knoxville-tn/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet McKinney, TX - easyvet.com/location/veterinarian-mckinney-tx/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('mckinney.easyvet.com', '298613413', 'easyvet McKinney, TX - easyvet.com/location/veterinarian-mckinney-tx/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Naples, FL - easyvet.com/location/veternarian-naples-fl/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('easyvet.com', '300701295', 'easyvet Naples, FL - easyvet.com/location/veternarian-naples-fl/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Winter Garden, FL - easyvet.com/location/winter-garden-fl (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('wintergarden.easyvet.com', '303769734', 'easyvet Winter Garden, FL - easyvet.com/location/winter-garden-fl', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Forney, TX - easyvet.com/location/veterinarian-forney-tx (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('forney.easyvet.com', '303791742', 'easyvet Forney, TX - easyvet.com/location/veterinarian-forney-tx', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet The Villages, FL - easyvet.com/location/veterinarian-the-villages-fl (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('easyvet.com', '303796893', 'easyvet The Villages, FL - easyvet.com/location/veterinarian-the-villages-fl', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Estero, FL - easyvet.com/location/veterinarian-estero-fl (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('estero.easyvet.com', '303769837', 'easyvet Estero, FL - easyvet.com/location/veterinarian-estero-fl', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Richmond, TX - easyvet.com/location/veterianrian-richmond-tx/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('richmond.easyvet.com', '303790835', 'easyvet Richmond, TX - easyvet.com/location/veterianrian-richmond-tx/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Cumming, GA - easyvet.com/location/veterinarian-cumming-ga (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('cumming.easyvet.com', '303764686', 'easyvet Cumming, GA - easyvet.com/location/veterinarian-cumming-ga', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Rosenberg, TX - easyvet.com/location/veterinarian-rosenberg-tx/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('rosenberg.easyvet.com', '303780528', 'easyvet Rosenberg, TX - easyvet.com/location/veterinarian-rosenberg-tx/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Manvel, TX - easyvet.com/location/veterinarian-manvel-tx (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('manvel.easyvet.com', '303767110', 'easyvet Manvel, TX - easyvet.com/location/veterinarian-manvel-tx', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Melissa, TX - easyvet.com/location/veterinarian-melissa-tx (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('melissa.easyvet.com', '303803562', 'easyvet Melissa, TX - easyvet.com/location/veterinarian-melissa-tx', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Murfreesboro - easyvet.com/location/veterinarian-murfreesboro-tn/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('murfreesboro.easyvet.com', '315266352', 'easyvet Murfreesboro - easyvet.com/location/veterinarian-murfreesboro-tn/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Iowa Colony, TX - easyvet.com/location/veterinarian-iowa-colony-tx/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('iowacolony.easyvet.com', '325615982', 'easyvet Iowa Colony, TX - easyvet.com/location/veterinarian-iowa-colony-tx/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Syracuse, UT - easyvet.com/location/veterinarian-syracuse-ut/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('easyvet.com', '332785944', 'easyvet Syracuse, UT - easyvet.com/location/veterinarian-syracuse-ut/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Magnolia, FL - easyvet.com/location/veterinarian-the-villages-magnolia-fl/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('magnolia.easyvet.com', '332750606', 'easyvet Magnolia, FL - easyvet.com/location/veterinarian-the-villages-magnolia-fl/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Missouri City, TX - easyvet.com/location/missouri-city-tx/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('easyvet.com', '332768673', 'easyvet Missouri City, TX - easyvet.com/location/missouri-city-tx/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Katy, TX - katy.easyvet.com (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('katy.easyvet.com', '332761513', 'easyvet Katy, TX - katy.easyvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Fort Mill, SC - easyvet.com/location/veterinarian-fort-mill-sc/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('fortmill.easyvet.com', '332764945', 'easyvet Fort Mill, SC - easyvet.com/location/veterinarian-fort-mill-sc/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Trail Crossing, UT - easyvet.com/location/veterinarian-trail-crossing-ut/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('easyvet.com', '332788588', 'easyvet Trail Crossing, UT - easyvet.com/location/veterinarian-trail-crossing-ut/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Richmond, TX - easyvet.com/location/veterianrian-aliana-tx (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('richmond.easyvet.com', '349328309', 'easyvet Richmond, TX - easyvet.com/location/veterianrian-aliana-tx', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Magnolia, FL - easyvet.com/location/veterinarian-the-villages-magnolia-fl/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('magnolia.easyvet.com', '362255952', 'easyvet Magnolia, FL - easyvet.com/location/veterinarian-the-villages-magnolia-fl/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Katy, TX - easyvet.com/location/veterinarian-katy-tx/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('katy.easyvet.com', '362927692', 'easyvet Katy, TX - easyvet.com/location/veterinarian-katy-tx/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet1 Meta - easyvet.com (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('easyvet.com', '365289005', 'easyvet1 Meta - easyvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Rosenberg, TX - easyvet.com/location/veterianarian-prosper-tx (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('rosenberg.easyvet.com', '365552030', 'easyvet Rosenberg, TX - easyvet.com/location/veterianarian-prosper-tx', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- easyvet Syracuse, UT - easyvet.com/location/veterinarian-syracuse-ut/ (easyvet Clinics)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('easyvet.com', '367403862', 'easyvet Syracuse, UT - easyvet.com/location/veterinarian-syracuse-ut/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- emergency animal hospital kirkland - emergencyanimalhospitalkirkland.com (Finn Hill Animal Hospital)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('emergencyanimalhospitalkirkland.com', '387066497', 'emergency animal hospital kirkland - emergencyanimalhospitalkirkland.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Pet Euthanasia Orange County - pethomeeuthanasiaorangecounty.com (Pet Home Euthanasia Service)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('pethomeeuthanasiaorangecounty.com', '362504939', 'Pet Euthanasia Orange County - pethomeeuthanasiaorangecounty.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Everett Veterinary Hospital - everettvet.com (Everett Veterinary Hospital)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('everettvet.com', '397686391', 'Everett Veterinary Hospital - everettvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Vetcheck Carmel - vetcheckpucc.com/locations/indiana/carmel (Vet Check pet urgent care center)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('vetcheckpucc.com', '286258302', 'Vetcheck Carmel - vetcheckpucc.com/locations/indiana/carmel', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- vetcheck Fishers - vetcheckpucc.com (Vet Check pet urgent care center)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('vetcheckpucc.com', '286236610', 'vetcheck Fishers - vetcheckpucc.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- VetCheck Frisco - vetcheckpucc.com/locations/texas/frisco/emergency-and-urgent-care (Vet Check pet urgent care center)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('vetcheckpucc.com', '371921167', 'VetCheck Frisco - vetcheckpucc.com/locations/texas/frisco/emergency-and-urgent-care', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- All Community Animal Hospital - veterinarianportertx.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianportertx.com', '253032892', 'All Community Animal Hospital - veterinarianportertx.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Animal Tender Pet Resort - animaltenderpetresort.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('animaltenderpetresort.com', '253117842', 'Animal Tender Pet Resort - animaltenderpetresort.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- American Pet Spa - americanpetspa.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('americanpetspa.com', '253141883', 'American Pet Spa - americanpetspa.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Animal Hospital On Milam Road - veterinariansangertx.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinariansangertx.com', '253108957', 'Animal Hospital On Milam Road - veterinariansangertx.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Atascocita Animal Hospital - veterinarianatascocitatx.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianatascocitatx.com', '253175455', 'Atascocita Animal Hospital - veterinarianatascocitatx.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- CompleteCare Veterinary Center - veterinarianstatenislandny.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianstatenislandny.com', '253134545', 'CompleteCare Veterinary Center - veterinarianstatenislandny.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Church Ranch Veterinary Center - veterinarianwestminsterco.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianwestminsterco.com', '253163484', 'Church Ranch Veterinary Center - veterinarianwestminsterco.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Hope Animal Clinic - veterinarianmarblefallstx.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianmarblefallstx.com', '253145067', 'Hope Animal Clinic - veterinarianmarblefallstx.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Culebra Creek Veterinary Hospital - veterinarianculebracreektx.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianculebracreektx.com', '253113534', 'Culebra Creek Veterinary Hospital - veterinarianculebracreektx.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- City Vet Veterinary Clinic - veterinarianlongislandny.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianlongislandny.com', '253163805', 'City Vet Veterinary Clinic - veterinarianlongislandny.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Eldorado Animal Clinic - veterinariansantafenm.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinariansantafenm.com', '253130115', 'Eldorado Animal Clinic - veterinariansantafenm.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dest Pet Pet Hotel of Woodstock - veterinarianwoodstockga.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianwoodstockga.com', '253174987', 'Dest Pet Pet Hotel of Woodstock - veterinarianwoodstockga.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dogaholics - dogaholics.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dogaholics.com', '253185676', 'Dogaholics - dogaholics.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Club Canine - myclubcanine.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('myclubcanine.com', '253123666', 'Club Canine - myclubcanine.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dest Pet Endless Love - endlesslovepetpalace.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('endlesslovepetpalace.com', '253114770', 'Dest Pet Endless Love - endlesslovepetpalace.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Monroe Animal Health Center - veterinarianmonroela.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianmonroela.com', '253119624', 'Monroe Animal Health Center - veterinarianmonroela.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Stone Oak Veterinary Clinic - veterinarianstoneoaktx.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianstoneoaktx.com', '253123584', 'Stone Oak Veterinary Clinic - veterinarianstoneoaktx.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Life of Riley Pet Hotel - lifeofrileypethotel.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('lifeofrileypethotel.com', '253119104', 'Life of Riley Pet Hotel - lifeofrileypethotel.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Jonesboro Animal Hospital - jonesboroanimalhospital.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('jonesboroanimalhospital.com', '253155664', 'Jonesboro Animal Hospital - jonesboroanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Huebner Oaks Veterinary Hospital - veterinarianhuebneroakstx.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianhuebneroakstx.com', '253172448', 'Huebner Oaks Veterinary Hospital - veterinarianhuebneroakstx.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Kings Crossing Animal Hospital - veterinariankingwoodtx.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinariankingwoodtx.com', '253113537', 'Kings Crossing Animal Hospital - veterinariankingwoodtx.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- North Shore Animal Hospital - veterinarianbaysideny.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianbaysideny.com', '253172555', 'North Shore Animal Hospital - veterinarianbaysideny.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Murray Hill Pet Hospital - veterinarianmurrayhillny.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianmurrayhillny.com', '253168274', 'Murray Hill Pet Hospital - veterinarianmurrayhillny.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Midlands Veterinary Practice - mvpdvm.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('mvpdvm.com', '253170612', 'Midlands Veterinary Practice - mvpdvm.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Wescott Acres - wescottacres.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('wescottacres.com', '253132142', 'Wescott Acres - wescottacres.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Northwood Animal Hospital - veterinariannorthwoodtx.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinariannorthwoodtx.com', '253180497', 'Northwood Animal Hospital - veterinariannorthwoodtx.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Windmill Veterinary Center - veterinarianprospertx.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianprospertx.com', '253176422', 'Windmill Veterinary Center - veterinarianprospertx.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Paws & Pals Resort - pawsresort.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('pawsresort.com', '253180819', 'Paws & Pals Resort - pawsresort.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Veterinary Care Unlimited - veterinarianjamaicany.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianjamaicany.com', '253186736', 'Veterinary Care Unlimited - veterinarianjamaicany.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Rover Resort (134) - roverresort.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('roverresort.com', '253169248', 'Rover Resort (134) - roverresort.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Story Road Animal Hospital - veterinarianirvingtx.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianirvingtx.com', '253181219', 'Story Road Animal Hospital - veterinarianirvingtx.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Town & Country Veterinary Hospital - veterinariansanantoniotx.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinariansanantoniotx.com', '253190291', 'Town & Country Veterinary Hospital - veterinariansanantoniotx.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Pampered Pooch Playground - pamperedpoochplayground.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('pamperedpoochplayground.com', '290851179', 'Pampered Pooch Playground - pamperedpoochplayground.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Animal Medical Hospital (150) (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('animalmedicalhosp.com', '291715127', 'Animal Medical Hospital (150)', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Whitestone Vet Care - whitestonevetcare.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('whitestonevetcare.com', '292276410', 'Whitestone Vet Care - whitestonevetcare.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Bow Wow Lounge - bowwowlounge.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('bowwowlounge.com', '295110041', 'Bow Wow Lounge - bowwowlounge.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Raintree Pet Resort - raintreepetscottsdale.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('raintreepetscottsdale.com', '296379754', 'Raintree Pet Resort - raintreepetscottsdale.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Atlanta Pet Resort - atlantapetresort.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('atlantapetresort.com', '297227246', 'Atlanta Pet Resort - atlantapetresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Sabal Chase Animal Clinic (163) - sabalchaseanimalclinic.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('sabalchaseanimalclinic.com', '297201300', 'Sabal Chase Animal Clinic (163) - sabalchaseanimalclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Rivermist Pet Lodge - rivermistpetlodge.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('rivermistpetlodge.com', '297898383', 'Rivermist Pet Lodge - rivermistpetlodge.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- K9 Coach - k-9coach.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('k-9coach.com', '304595365', 'K9 Coach - k-9coach.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Happy Camper Doggy Day Camp & SleepOver - doggydaycamp.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('doggydaycamp.com', '306106575', 'Happy Camper Doggy Day Camp & SleepOver - doggydaycamp.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Kennel Care - thekennelcare.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('thekennelcare.com', '327771011', 'The Kennel Care - thekennelcare.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Golrusk Pet Care - golrusk.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('golrusk.com', '452253560', 'Golrusk Pet Care - golrusk.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Happy Dogs Play and Stay - happydogsplayandstay.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('happydogsplayandstay.com', '452233701', 'Happy Dogs Play and Stay - happydogsplayandstay.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Rockstar Pets Chicago - rockstarpetschicago.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('rockstarpetschicago.com', '452224344', 'Rockstar Pets Chicago - rockstarpetschicago.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Oviedo Pet Resort - oviedopetresort.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('oviedopetresort.com', '452261234', 'Oviedo Pet Resort - oviedopetresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Whole Dogz - wholedogz.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('wholedogz.com', '452258608', 'Whole Dogz - wholedogz.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Brooke''s Bed & Biscuit - brookesbedandbiscuit.co (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('brookesbedandbiscuit.co', '452237810', 'Brooke''s Bed & Biscuit - brookesbedandbiscuit.co', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- All Friends Animal Hospital - allfriendsanimalhospital.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('allfriendsanimalhospital.com', '452253055', 'All Friends Animal Hospital - allfriendsanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Touch of Class Pet Resort - atouchofclasspetresort.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('atouchofclasspetresort.com', '452232213', 'Touch of Class Pet Resort - atouchofclasspetresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dog Days - dogdaysandnights.com (Destination Pet 1)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dogdaysandnights.com', '452233925', 'Dog Days - dogdaysandnights.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Woof Room - woofroomroseville.com (Destination Pet 2)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('woofroomroseville.com', '291696156', 'The Woof Room - woofroomroseville.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Cat Clinic - thecatclinic.com (Destination Pet 2)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('thecatclinic.com', '297248949', 'The Cat Clinic - thecatclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- TK 9 Academy - teclask9academy.com (Destination Pet 2)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('teclask9academy.com', '297905515', 'TK 9 Academy - teclask9academy.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Posh Paw Resort - poshpawresort.com (Destination Pet 2)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('poshpawresort.com', '306500844', 'The Posh Paw Resort - poshpawresort.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Its A Dogs Life Resort - itsadogsliferesort.com (Destination Pet 2)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('itsadogsliferesort.com', '336685870', 'Its A Dogs Life Resort - itsadogsliferesort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

--  Country Kennel - countrykennelboarding.com (Destination Pet 2)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('countrykennelboarding.com', '346707534', ' Country Kennel - countrykennelboarding.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Best Friends Bed & Biscuit - bedandbiscuit.com (Destination Pet 2)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('bedandbiscuit.com', '346761034', 'Best Friends Bed & Biscuit - bedandbiscuit.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Camp Wagging Tails - campwaggingtails.com (Destination Pet 2)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('campwaggingtails.com', '346733034', 'Camp Wagging Tails - campwaggingtails.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Holiday Pet Hotel - holidaypethotel.com (Destination Pet 2)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('holidaypethotel.com', '347102534', 'Holiday Pet Hotel - holidaypethotel.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Zionsville Country Kennel - zionsvillekennel.com (Destination Pet 2)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('zionsvillekennel.com', '348001811', 'Zionsville Country Kennel - zionsvillekennel.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- K9 Kaos - k9kaos.com (Destination Pet 2)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('k9kaos.com', '436602804', 'K9 Kaos - k9kaos.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Top Dog Retreat - topdogretreat.com (Destination Pet 2)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('topdogretreat.com', '436588379', 'Top Dog Retreat - topdogretreat.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Top Dog Retreat - wolfpackcanine.com (Destination Pet 2)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('wolfpackcanine.com', '436567630', 'Top Dog Retreat - wolfpackcanine.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Pet Nation Lodge - petnationlodge.net (Destination Pet 2)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('petnationlodge.net', '436558244', 'Pet Nation Lodge - petnationlodge.net', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Exceptional Pets Green Valley - exceptionalpets.com/locations/green-valley (Exceptional Pets _ VMP)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('exceptionalpets.com', '255041959', 'Exceptional Pets Green Valley - exceptionalpets.com/locations/green-valley', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Exceptional Pets Cave Creek - exceptionalpets.com/locations/cave-creek (Exceptional Pets _ VMP)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('exceptionalpets.com', '255038360', 'Exceptional Pets Cave Creek - exceptionalpets.com/locations/cave-creek', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Exceptional Pets Maricopa - exceptionalpets.com/locations/maricopa (Exceptional Pets _ VMP)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('exceptionalpets.com', '255022600', 'Exceptional Pets Maricopa - exceptionalpets.com/locations/maricopa', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Exceptional Pets Chandler - exceptionalpets.com/locations/chandler (Exceptional Pets _ VMP)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('exceptionalpets.com', '255023626', 'Exceptional Pets Chandler - exceptionalpets.com/locations/chandler', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Exceptional Pets Mesa - exceptionalpets.com/locations/mesa (Exceptional Pets _ VMP)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('exceptionalpets.com', '255035160', 'Exceptional Pets Mesa - exceptionalpets.com/locations/mesa', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Exceptional Pets Main - exceptionalpets.com (Exceptional Pets _ VMP)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('exceptionalpets.com', '254960525', 'Exceptional Pets Main - exceptionalpets.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Animal Care Hospital of Walnut Creek - GA4 (Animal Care Hospital of Walnut Creek - achwalnutcreek.com)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('achwalnutcreek.com', '350034575', 'Animal Care Hospital of Walnut Creek - GA4', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Veterinarian Recruiter - veterinarianrecruiter.com (Vetcelerator Brand)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianrecruiter.com', '287667276', 'Veterinarian Recruiter - veterinarianrecruiter.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Vetcelerator - vetcelerator.com (Vetcelerator Brand)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('vetcelerator.com', '327308495', 'Vetcelerator - vetcelerator.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Vetcelerator Client Portal  (Vetcelerator Brand)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('portal.vetcelerator.com', '478862146', 'Vetcelerator Client Portal ', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Nova Animal Hospital - novaanimalhospitalva.com (Doctor K Accounts)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('novaanimalhospitalva.com', '309187388', 'Nova Animal Hospital - novaanimalhospitalva.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Main (Vetcelerator)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('vetcelerator.com', '327707209', 'Main', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- https://veterinarianofgreenwoodvillageco.com/ (Advanced Veterinary Care)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianofgreenwoodvillageco.com', '333354799', 'https://veterinarianofgreenwoodvillageco.com/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Small Animal Emergency Hospital of Westfield - GA4 (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('smallanimalemergencyhospitalofwestfield.com', '252513357', 'Small Animal Emergency Hospital of Westfield - GA4', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Spirit of 76th Veterinary Clinic - https://spiritof76thveterinaryclinic.com/ (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('spiritof76thveterinaryclinic.com', '253947371', 'Spirit of 76th Veterinary Clinic - https://spiritof76thveterinaryclinic.com/', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dugan''s Dog House - dugansdoghouse.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dugansdoghouse.com', '257589975', 'Dugan''s Dog House - dugansdoghouse.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Abbey Vet Hospital - abbeyvetantioch.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('abbeyvetantioch.com', '260913914', 'Abbey Vet Hospital - abbeyvetantioch.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Salmon River Mobile Vet - salmonrivermobilevet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('salmonrivermobilevet.com', '295232733', 'Salmon River Mobile Vet - salmonrivermobilevet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Shepherds Vineyard Animal Hospital - shepherdsvineyardanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('shepherdsvineyardanimalhospital.com', '300278419', 'Shepherds Vineyard Animal Hospital - shepherdsvineyardanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- West Side Veterinary Marietta - westsideveterinarymariettaga.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('westsideveterinarymariettaga.com', '301671505', 'West Side Veterinary Marietta - westsideveterinarymariettaga.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- GA4 tracking (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('clubhillanimalclinic.com', '325666719', 'GA4 tracking', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Mariemont Veterinary Center GA4 (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('mariemontvetclinic.com', '327656538', 'Mariemont Veterinary Center GA4', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Cat Grooming House Call - catgroominghousecall.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('catgroominghousecall.com', '332683108', 'Cat Grooming House Call - catgroominghousecall.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Center Veterinary Clinic - novatovetclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('novatovetclinic.com', '334798110', 'Center Veterinary Clinic - novatovetclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- NB Animal Urgent Care (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('nbanimalurgentcare.com', '338356960', 'NB Animal Urgent Care', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Creature Comforts - creaturecomfortsveterinary.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('creaturecomfortsveterinary.com', '347008369', 'Creature Comforts - creaturecomfortsveterinary.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Laurel Pet Resort - laurelpetresort.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('laurelpetresort.com', '347023178', 'Laurel Pet Resort - laurelpetresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Norton Health Center - nortonanimalhealthcenter.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('nortonanimalhealthcenter.com', '347289013', 'Norton Health Center - nortonanimalhealthcenter.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Country Club Veterinary Clinic - countryclubvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('countryclubvet.com', '348905664', 'Country Club Veterinary Clinic - countryclubvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- ABC Veterinary Clinic of Lewisville - abcvetoflewisville.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('abcvetoflewisville.com', '350030153', 'ABC Veterinary Clinic of Lewisville - abcvetoflewisville.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- 4 Paws Mobile Veterinary Services - 4paws.vet  (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('4paws.vet', '350020001', '4 Paws Mobile Veterinary Services - 4paws.vet ', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Affordable Animal Emergency Clinic - emergencyvetpugetsound.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('emergencyvetpugetsound.com', '350016960', 'Affordable Animal Emergency Clinic - emergencyvetpugetsound.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Colonial Animal Hospital - colonialblvdanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('colonialblvdanimalhospital.com', '350205823', 'Colonial Animal Hospital - colonialblvdanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dollys Animal Clinic - dollysanimalclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dollysanimalclinic.com', '353197163', 'Dollys Animal Clinic - dollysanimalclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Premiumvetcare.com - premiumvetcare.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('premiumvetcare.com', '356938251', 'Premiumvetcare.com - premiumvetcare.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Advanced Veterinary Care - veterinarianofgreenwoodvillageco.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianofgreenwoodvillageco.com', '356973054', 'Advanced Veterinary Care - veterinarianofgreenwoodvillageco.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Fremont Animal Hospital - fremontanimalhospital.net (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('fremontanimalhospital.net', '358969634', 'Fremont Animal Hospital - fremontanimalhospital.net', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Pet Vet Vaccination Services LLC - 855petvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('855petvet.com', '358986417', 'Pet Vet Vaccination Services LLC - 855petvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Riverview Veterinary Center - riverviewveterinarycenter.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('riverviewveterinarycenter.com', '358959649', 'Riverview Veterinary Center - riverviewveterinarycenter.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Family Veterinary Inc. - familyveterinaryinc.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('familyveterinaryinc.com', '360142634', 'Family Veterinary Inc. - familyveterinaryinc.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Wilderness Trace Veterinary Clinic  - wildernesstracevetclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('wildernesstracevetclinic.com', '360948930', 'Wilderness Trace Veterinary Clinic  - wildernesstracevetclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Cedar Ridge Veterinary Hospital   - cedarridgevetok.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('cedarridgevetok.com', '360957354', 'Cedar Ridge Veterinary Hospital   - cedarridgevetok.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Happy Paws House Calls - GA4 (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('happypawshousecall.com', '361264713', 'Happy Paws House Calls - GA4', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Alex The Cat Groomer - alex-the-cat-groomer.business.site (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('alex-the-cat-groomer.business.site', '362132905', 'Alex The Cat Groomer - alex-the-cat-groomer.business.site', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Forest Hill Veterinary Hospital - foresthillvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('foresthillvet.com', '362611789', 'Forest Hill Veterinary Hospital - foresthillvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- thecompletecatveterinaryclinic.com - thecompletecatveterinaryclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('thecompletecatveterinaryclinic.com', '362699528', 'thecompletecatveterinaryclinic.com - thecompletecatveterinaryclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- VETERINARY HEALING & ADVANCED IMAGING - veterinaryhealingimaging.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinaryhealingimaging.com', '362765079', 'VETERINARY HEALING & ADVANCED IMAGING - veterinaryhealingimaging.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Fayetteville Animal Clinic Tn - fayettevilleanimalclinic-tn.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('fayettevilleanimalclinic-tn.com', '362898880', 'Fayetteville Animal Clinic Tn - fayettevilleanimalclinic-tn.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Companion Animal Hospital - companimal.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('companimal.com', '363140959', 'Companion Animal Hospital - companimal.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Miami Pet Clinic - miamipetclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('miamipetclinic.com', '365860687', 'Miami Pet Clinic - miamipetclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Specification Chemicals, INC - GA4 (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('spec-chem.com', '366619843', 'Specification Chemicals, INC - GA4', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- At home Veterinary Services - athomevetservices.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('athomevetservices.com', '367112977', 'At home Veterinary Services - athomevetservices.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- stoneridgeanimalhospital.com - stoneridgeanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('stoneridgeanimalhospital.com', '367908319', 'stoneridgeanimalhospital.com - stoneridgeanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- UA tracking - GA4 (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('evergreenpetvet.com', '370648172', 'UA tracking - GA4', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Jared the Cat Groomer - jaredthecatgroomer.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('jaredthecatgroomer.com', '371105415', 'Jared the Cat Groomer - jaredthecatgroomer.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Cedarbrook Veterinary Care - cedarbrookvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('cedarbrookvet.com', '371318964', 'Cedarbrook Veterinary Care - cedarbrookvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Pet Care & Surgery Center - petcarecenter.org (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('petcarecenter.org', '378125644', 'Pet Care & Surgery Center - petcarecenter.org', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- West Babylon Animal Hospital - westbabylonanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('westbabylonanimalhospital.com', '385853899', 'West Babylon Animal Hospital - westbabylonanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Hamilton Niagara Pet Euthanasia Mobile Services - peteuthanasiahamiltonniagara.ca (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('pehn.ca', '390756053', 'Hamilton Niagara Pet Euthanasia Mobile Services - peteuthanasiahamiltonniagara.ca', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Lyon Veterinary Clinic - lyonveterinaryclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('lyonveterinaryclinic.com', '394593456', 'Lyon Veterinary Clinic - lyonveterinaryclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- 4 Pets Animal Clinic - 4petsanimalclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('4petsanimalclinic.com', '394644617', '4 Pets Animal Clinic - 4petsanimalclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Veterinary Home Healthcare & Chiropractic - veterinaryhomehealthcare.net (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinaryhomehealthcare.net', '395044285', 'Veterinary Home Healthcare & Chiropractic - veterinaryhomehealthcare.net', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- East & West AH - eastwestah.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('eastwestah.com', '395159826', 'East & West AH - eastwestah.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Everett Veterinary Hospital - everettvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('everettvet.com', '395451633', 'Everett Veterinary Hospital - everettvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Finn Hill Animal Hospital - finnhillanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('finnhillanimalhospital.com', '395439333', 'Finn Hill Animal Hospital - finnhillanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dickin Memorial Animal Hospital - dickinmemorialanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dickinmemorialanimalhospital.com', '396278801', 'Dickin Memorial Animal Hospital - dickinmemorialanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Bay Animal Hospital - bayanimalhospital.net (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('bayanimalhospital.net', '396365492', 'Bay Animal Hospital - bayanimalhospital.net', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Brown Animal Hospital - brownanimalhosp.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('brownanimalhosp.com', '397148666', 'Brown Animal Hospital - brownanimalhosp.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- River Rock Animal Hospital - vetmidland.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('vetmidland.com', '402524484', 'River Rock Animal Hospital - vetmidland.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Elm Grove Animal Hospital - elmgroveah.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('elmgroveah.com', '403148220', 'Elm Grove Animal Hospital - elmgroveah.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Hefner Road Animal Hospital - hefnerroadanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('hefnerroadanimalhospital.com', '403257070', 'Hefner Road Animal Hospital - hefnerroadanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Hefner Road Pet Resort - hefnerroadpetresort.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('hefnerroadpetresort.com', '403251452', 'Hefner Road Pet Resort - hefnerroadpetresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Frenship Veterinary Clinic - frenshipvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('frenshipvet.com', '405134573', 'Frenship Veterinary Clinic - frenshipvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Jux Health - juxhealth.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('juxhealth.com', '407500203', 'Jux Health - juxhealth.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dr Fitz''s Bayside Animal Clinic - drfitzsbayside.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('drfitzsbayside.com', '411598023', 'Dr Fitz''s Bayside Animal Clinic - drfitzsbayside.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Locust Trace Veterinary Clinic - locusttraceveterinaryclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('locusttraceveterinaryclinic.com', '413610000', 'Locust Trace Veterinary Clinic - locusttraceveterinaryclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Orange City Family Animal Care - ocfamilyanimalcare.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('ocfamilyanimalcare.com', '413981961', 'Orange City Family Animal Care - ocfamilyanimalcare.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Clarksburg Animal Hosptial - clarksburganimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('Clarksburganimalhospital.com', '414094108', 'Clarksburg Animal Hosptial - clarksburganimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Hampton Park Veterinary Hospital - hamptonparkvets.com.au (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('hamptonparkvets.com.au', '414087672', 'Hampton Park Veterinary Hospital - hamptonparkvets.com.au', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Cicero Animal Clinic P. C - ciceroanimalclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('ciceroanimalclinic.com', '416458362', 'Cicero Animal Clinic P. C - ciceroanimalclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Compassion Veterinary Center - compassionveterinarycenter.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('compassionveterinarycenter.com', '416454683', 'Compassion Veterinary Center - compassionveterinarycenter.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dickin Memorial Animal Hospital - dickinmemorialanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dickinmemorialanimalhospital.com', '416444069', 'Dickin Memorial Animal Hospital - dickinmemorialanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- McMillin Animal Hospital - mcmillinvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('mcmillinvet.com', '416341142', 'McMillin Animal Hospital - mcmillinvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Bird and Exotic Hospital - birdexoticvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('birdexoticvet.com', '416491384', 'The Bird and Exotic Hospital - birdexoticvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Homeward Bound Vet Services - homewardboundvetservices.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('homewardboundvetservices.com', '416488157', 'Homeward Bound Vet Services - homewardboundvetservices.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- A Pets Farewell - apetsfarewell.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('apetsfarewell.com', '416504143', 'A Pets Farewell - apetsfarewell.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Veterinarian Of Green Wood Village co - veterinarianofgreenwoodvillageco.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianofgreenwoodvillageco.com', '416521178', 'Veterinarian Of Green Wood Village co - veterinarianofgreenwoodvillageco.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Laurel Pet Resort - laurelpetresort.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('laurelpetresort.com', '416493586', 'Laurel Pet Resort - laurelpetresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Robinson Animal Hospital - robinsonah.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('robinsonah.com', '416561924', 'Robinson Animal Hospital - robinsonah.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Preventive Veterinary Medicine Clinic - pvmcvet.com  (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('pvmcvet.com', '416492876', 'Preventive Veterinary Medicine Clinic - pvmcvet.com ', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Novato Center Veterinary Clinic - novatovetclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('novatovetclinic.com', '416863370', 'Novato Center Veterinary Clinic - novatovetclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Fayetteville Animal Clinic TN - fayettevilleanimalclinic-tn.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('fayettevilleanimalclinic-tn.com', '416850187', 'Fayetteville Animal Clinic TN - fayettevilleanimalclinic-tn.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Animal Medical Center Kansas City - animalmedicalcenterkc.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('animalmedicalcenterkc.com', '416849893', 'Animal Medical Center Kansas City - animalmedicalcenterkc.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Miami Pet Clinic - miamipetclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('miamipetclinic.com', '416860227', 'Miami Pet Clinic - miamipetclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Family Veterinary Inc - familyveterinaryinc.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('familyveterinaryinc.com', '416847717', 'Family Veterinary Inc - familyveterinaryinc.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Kellycrossing Animal Hospital - kellycrossinganimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('kellycrossinganimalhospital.com', '416838765', 'Kellycrossing Animal Hospital - kellycrossinganimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Happy Valley Pet Hospital - happyvalleypethospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('happyvalleypethospital.com', '416796294', 'Happy Valley Pet Hospital - happyvalleypethospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Finn Hill Animal Hospital and Urgent Care - emergencyanimalhospitalkirkland.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('emergencyanimalhospitalkirkland.com', '416873499', 'Finn Hill Animal Hospital and Urgent Care - emergencyanimalhospitalkirkland.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Maynard Animal Hospital - maynardaffordablepeturgentcare.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('maynardaffordablepeturgentcare.com', '416883974', 'Maynard Animal Hospital - maynardaffordablepeturgentcare.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Pinehurst Veterinary Hospital Olympia - pinehurstveterinaryhospitalolympia.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('pinehurstveterinaryhospitalolympia.com', '416853809', 'Pinehurst Veterinary Hospital Olympia - pinehurstveterinaryhospitalolympia.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Sweethome Veterinary Hospital - sweethomevets.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('sweethomevets.com', '416904872', 'Sweethome Veterinary Hospital - sweethomevets.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Stoneridge Animal Hospital - stoneridgeanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('stoneridgeanimalhospital.com', '416837014', 'Stoneridge Animal Hospital - stoneridgeanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The complete Cat Veterinary Clinic - thecompletecatveterinaryclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('thecompletecatveterinaryclinic.com', '416831323', 'The complete Cat Veterinary Clinic - thecompletecatveterinaryclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Big Island Pet Care Center - bigislandpetcarecenter.org (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('bigislandpetcarecenter.org', '417896154', 'Big Island Pet Care Center - bigislandpetcarecenter.org', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Heritage Animal Clinic - heritageanimalclinicmadison.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('heritageanimalclinicmadison.com', '418161084', 'Heritage Animal Clinic - heritageanimalclinicmadison.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- MyVet Chesapeake - myvetchesapeake.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('myvetchesapeake.com', '420409215', 'MyVet Chesapeake - myvetchesapeake.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Fox Veterinary Hospital - foxvets.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('foxvets.com', '420503100', 'Fox Veterinary Hospital - foxvets.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Camden Animal Hospital - camdenanimalhosp.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('camdenanimalhosp.com', '421709611', 'Camden Animal Hospital - camdenanimalhosp.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Mount Berry Animal Hospital - mtberryah.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('mtberryah.com', '424405053', 'Mount Berry Animal Hospital - mtberryah.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Arab Veterinary Hospital - arabvethospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('arabvethospital.com', '424459368', 'Arab Veterinary Hospital - arabvethospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Marianna Animal Hospital - marianaanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('marianaanimalhospital.com', '424466651', 'Marianna Animal Hospital - marianaanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- All Creatures Veterinary Hospital - allcreatureswy.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('allcreatureswy.com', '424841405', 'All Creatures Veterinary Hospital - allcreatureswy.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Somerville Animal Hospital - somervilleanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('somervilleanimalhospital.com', '428403598', 'Somerville Animal Hospital - somervilleanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

--  Greenbrier Animal Clinic - greenbrieranimalclinic.net (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('greenbrieranimalclinic.net', '428371091', ' Greenbrier Animal Clinic - greenbrieranimalclinic.net', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Anchor Bay Veterinary Center - anchorbayvc.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('anchorbayvc.com', '428883732', 'Anchor Bay Veterinary Center - anchorbayvc.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Cave Spring Animal Hospital - cavespringah.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('cavespringah.com', '429599989', 'Cave Spring Animal Hospital - cavespringah.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Del Valle Pet Hospital - delvallepethospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('delvallepethospital.com', '429813408', 'Del Valle Pet Hospital - delvallepethospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dirigo Veterinary Care - dirigovet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dirigovet.com', '430335854', 'Dirigo Veterinary Care - dirigovet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- All Aboard Animal Hospital - allaboardanimal.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('allaboardanimal.com', '430395753', 'All Aboard Animal Hospital - allaboardanimal.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Fleur Pet Hospital - fleurpethospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('fleurpethospital.com', '431133406', 'Fleur Pet Hospital - fleurpethospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dogtopia Fort Myers - dogtopia.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dogtopia.com', '431615004', 'Dogtopia Fort Myers - dogtopia.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Sequoyah Waggin Tails Lodge - waggintailslodge.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('waggintailslodge.com', '433145537', 'Sequoyah Waggin Tails Lodge - waggintailslodge.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- North Powers Animal Hospital - npahvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('npahvet.com', '434226435', 'North Powers Animal Hospital - npahvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Garage Hair Lounge - thegaragehairlounge.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('thegaragehairlounge.com', '436300159', 'The Garage Hair Lounge - thegaragehairlounge.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Mahomet Animal Hospital - mahosp.info (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('mahometanimalhospital.com', '436713895', 'Mahomet Animal Hospital - mahosp.info', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Airway Veterinary Clinic - airwayveterinaryclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('airwayveterinaryclinic.com', '437831648', 'Airway Veterinary Clinic - airwayveterinaryclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- PetNest - petnestanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('petnestanimalhospital.com', '442401081', 'PetNest - petnestanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Stone Cottage Veterinary Hospital - vetnewburgh.com  (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('vetnewburgh.com', '442767434', 'Stone Cottage Veterinary Hospital - vetnewburgh.com ', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Premier Animal Wellness & Surgery Hospital - animalhospitalbowlinggreenky.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('animalhospitalbowlinggreenky.com', '442915169', 'Premier Animal Wellness & Surgery Hospital - animalhospitalbowlinggreenky.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Willow Bend Veterinary Clinic - willowbendvetclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('willowbendvetclinic.com', '444832111', 'Willow Bend Veterinary Clinic - willowbendvetclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Republican Valley Veterinary Clinic - republicanvalleyveterinaryclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('republicanvalleyveterinaryclinic.com', '445805884', 'Republican Valley Veterinary Clinic - republicanvalleyveterinaryclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Giovanni Med Spa - giovannimedspa.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('giovannimedspa.com', '446828988', 'Giovanni Med Spa - giovannimedspa.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Chase Oaks Animal Clinic - chaseoaksvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('chaseoaksvet.com', '450433645', 'Chase Oaks Animal Clinic - chaseoaksvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Pumpkin Hill Veterinary Clinic - pumpkinhillvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('pumpkinhillvet.com', '450439413', 'Pumpkin Hill Veterinary Clinic - pumpkinhillvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- East Holland Veterinary Clinic - easthollandvet.net (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('easthollandvet.net', '451515594', 'East Holland Veterinary Clinic - easthollandvet.net', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Hefner Road Animal Hospital - hefnerroadanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('hefnerroadanimalhospital.com', '451490449', 'Hefner Road Animal Hospital - hefnerroadanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Colony Animal Clinic - thecolonyanimalclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('apetsfarewell.com', '451812732', 'The Colony Animal Clinic - thecolonyanimalclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Jupiter Veterinary Hospital - jupiterveterinaryhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('jupiterveterinaryhospital.com', '452462770', 'Jupiter Veterinary Hospital - jupiterveterinaryhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Cloverleaf Animal Clinic - cloverleafac.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('cloverleafac.com', '452521174', 'Cloverleaf Animal Clinic - cloverleafac.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Herd Health Management - herdhealth.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('herdhealth.com', '453029207', 'Herd Health Management - herdhealth.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- PetSmart Vet Services Georgetown - petsmartvetgeorgetown.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('petsmartvetgeorgetown.com', '455168685', 'PetSmart Vet Services Georgetown - petsmartvetgeorgetown.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- 49th Street Veterinary Clinic - 49thstreetvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('49thstreetvet.com', '455531407', '49th Street Veterinary Clinic - 49thstreetvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- All Paws Animal Hospital - allpawsanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('allpawsanimalhospital.com', '456267855', 'All Paws Animal Hospital - allpawsanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Shiland Animal Hospital - shilandah.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('shilandah.com', '459601893', 'Shiland Animal Hospital - shilandah.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Green Level Animal Hospital - greenlevelvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('greenlevelvet.com', '461585814', 'Green Level Animal Hospital - greenlevelvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Northern Pike Veterinary Hospital - northernpikevets.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('northernpikevets.com', '464325622', 'Northern Pike Veterinary Hospital - northernpikevets.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Mobile Vet Care Indiana - mobilevetindiana.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('mobilevetindiana.com', '466065449', 'Mobile Vet Care Indiana - mobilevetindiana.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- My Village Pet Clinic - myvillagepetclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('myvillagepetclinic.com', '466834054', 'My Village Pet Clinic - myvillagepetclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- TruVet Pet Hospital - truvetpethospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('truvetpethospital.com', '468044834', 'TruVet Pet Hospital - truvetpethospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Animal Cove Pet Hospital - animalcove.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('animalcove.com', '470151605', 'Animal Cove Pet Hospital - animalcove.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Happy Paws House Calls - happypawshousecall.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('happypawshousecall.com', '470152254', 'Happy Paws House Calls - happypawshousecall.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Coops Creek Veterinary Clinic - coopscreekvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('coopscreekvet.com', '470550464', 'Coops Creek Veterinary Clinic - coopscreekvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- PetSmart Vet Services Springfield - petsmartvetspringfield.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('petsmartvetspringfield.com', '475080998', 'PetSmart Vet Services Springfield - petsmartvetspringfield.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Ord Animal Clinic - veterinarianordne.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('veterinarianordne.com', '475774010', 'Ord Animal Clinic - veterinarianordne.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- TopTails - toptailsvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('toptailsvet.com', '478051638', 'TopTails - toptailsvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Sequoyah K9 Academy - sequoyahk9academy.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('sequoyahk9academy.com', '479065232', 'Sequoyah K9 Academy - sequoyahk9academy.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Redlands Animal Hospital - redlandsanimalhospital.net (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('redlandsanimalhospital.net', '480073913', 'Redlands Animal Hospital - redlandsanimalhospital.net', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Just for Pets Animal Hospital - justforpetsanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('justforpetsanimalhospital.com', '480882806', 'Just for Pets Animal Hospital - justforpetsanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Easyvet Frisco - frisco.easyvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('frisco.easyvet.com', '481872372', 'Easyvet Frisco - frisco.easyvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Easyvet Allen - allen.easyvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('allen.easyvet.com', '482355611', 'Easyvet Allen - allen.easyvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Animal Hospital of Fort Lauderdale - ahofl.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('ahofl.com', '482372604', 'Animal Hospital of Fort Lauderdale - ahofl.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Easyvet Melissa - melissa.easyvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('melissa.easyvet.com', '483207102', 'Easyvet Melissa - melissa.easyvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Bare Kitty Waxing - barekittywaxing.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('barekittywaxing.com', '484078550', 'Bare Kitty Waxing - barekittywaxing.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Mariemont Veterinary Clinic - mariemontvetclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('mariemontvetclinic.com', '485384841', 'Mariemont Veterinary Clinic - mariemontvetclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Burien Veterinary Hospital - burienvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('burienvet.com', '487282687', 'Burien Veterinary Hospital - burienvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Davison Vet Integrated Care - davisonvethospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('davisonvethospital.com', '487519612', 'Davison Vet Integrated Care - davisonvethospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Kindness Animal Hospital - kindnessanimal.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('kindnessanimal.com', '487975173', 'Kindness Animal Hospital - kindnessanimal.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Westgate Animal Hospital - westgateanimalhospitalwa.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('westgateanimalhospitalwa.com', '493060844', 'Westgate Animal Hospital - westgateanimalhospitalwa.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Affordable Animal Hospital - affordableanimalhospitaltacoma.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('affordableanimalhospitaltacoma.com', '493013303', 'Affordable Animal Hospital - affordableanimalhospitaltacoma.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Cameron Veterinary Hospital - cameronvet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('cameronvet.com', '493263043', 'Cameron Veterinary Hospital - cameronvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Companion Care Animal Hospital - companioncareanimalhospital.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('companioncareanimalhospital.com', '494389698', 'Companion Care Animal Hospital - companioncareanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Pacific Paws (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('pacificpawsvet.com', '495004019', 'Pacific Paws', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- queencityvetclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('queencityvetclinic.com', '497414279', 'queencityvetclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Club Hill Animal Clinic - clubhillanimalclinic.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('clubhillanimalclinic.com', '497676304', 'Club Hill Animal Clinic - clubhillanimalclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Murphy Electric - gomurphyelectric.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('gomurphyelectric.com', '498887456', 'Murphy Electric - gomurphyelectric.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Orchard Veterinary Clinic-orchardvethosp.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('orchardvethosp.com', '500492123', 'Orchard Veterinary Clinic-orchardvethosp.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Delaware Veterinary Dental Practice (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('delvetdental.com', '501977153', 'Delaware Veterinary Dental Practice', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Homeward Bound Veterinary Services Urgent Care - homewardboundurgentcarevet.com (Vetcelerator Clients Accounts 2025)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('homewardboundurgentcarevet.com', '505198825', 'Homeward Bound Veterinary Services Urgent Care - homewardboundurgentcarevet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Eno Animal Hospital - enoanimalhospital.com (Eno Animal Hospital)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('enoanimalhospital.com', '346612794', 'Eno Animal Hospital - enoanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Animal Health Clinic - ahcbr.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('ahcbr.com', '388429580', 'Animal Health Clinic - ahcbr.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Bass Pet Resort - basspetresort.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('basspetresort.com', '390033109', 'Bass Pet Resort - basspetresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Browndog Lodge - browndoglodge.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('browndoglodge.com', '390031614', 'Browndog Lodge - browndoglodge.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Canine Courtyard - caninecourtyard.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('caninecourtyard.com', '390045733', 'Canine Courtyard - caninecourtyard.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Canine Fitness and Fun - caninefitnessandfuncenter.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('caninefitnessandfuncenter.com', '390035835', 'Canine Fitness and Fun - caninefitnessandfuncenter.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Divine Canine - divinecanine.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('divinecanine.com', '390047567', 'Divine Canine - divinecanine.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dugan’s Veterinary Hospital - dugansvethospital.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dugansvethospital.com', '390042609', 'Dugan’s Veterinary Hospital - dugansvethospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Doggy Haven - doggyhaven.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('doggyhaven.com', '390019349', 'Doggy Haven - doggyhaven.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- All Star Pet Resort - allstarresort.net (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('allstarresort.net', '390022948', 'All Star Pet Resort - allstarresort.net', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Sparta Pet Palazzo (147) - spartapetpalazzo.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('spartapetpalazzo.com', '390055543', 'Sparta Pet Palazzo (147) - spartapetpalazzo.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dog Days - dogdaysatlanta.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dogdaysatlanta.com', '390042610', 'Dog Days - dogdaysatlanta.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dugan''s Dog House - dugansdoghouse.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dugansdoghouse.com', '390019253', 'Dugan''s Dog House - dugansdoghouse.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Pet Palace - thepetpalace.net (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('thepetpalace.net', '390053019', 'The Pet Palace - thepetpalace.net', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Yard Dog - theyarddog.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('theyarddog.com', '390020258', 'The Yard Dog - theyarddog.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dugan''s Veterinary Hospital (158) - dugansvet.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dugansvet.com', '390018634', 'Dugan''s Veterinary Hospital (158) - dugansvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Wet Noses & Wagging Tails - waggingtails.dog (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('waggingtails.dog', '390012248', 'Wet Noses & Wagging Tails - waggingtails.dog', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Uberdog - myuberdog.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('myuberdog.com', '390024874', 'Uberdog - myuberdog.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Wolf Pack Canine - wolfpackcanine.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('wolfpackcanine.com', '390030511', 'Wolf Pack Canine - wolfpackcanine.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Greymont Kennel - greymontkennel.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('greymontkennel.com', '390043311', 'Greymont Kennel - greymontkennel.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Lone Star Pet Lodges - lonestarpetlodges.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('lonestarpetlodges.com', '390041008', 'Lone Star Pet Lodges - lonestarpetlodges.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Paw Mankato - thepawmankato.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('thepawmankato.com', '390053531', 'The Paw Mankato - thepawmankato.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Two Ponds Pet Lodge - twopondspetlodge.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('twopondspetlodge.com', '390045134', 'Two Ponds Pet Lodge - twopondspetlodge.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Barkers Pet Center - barkerspetcenter.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('barkerspetcenter.com', '390021729', 'The Barkers Pet Center - barkerspetcenter.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Heritage Pet - heritagepet.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('heritagepet.com', '390015736', 'Heritage Pet - heritagepet.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Bluebonnet Bunk''n Biscuit - mybunknbiscuit.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('mybunknbiscuit.com', '390029312', 'Bluebonnet Bunk''n Biscuit - mybunknbiscuit.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Shelter Island Vet - shelterislandvet.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('shelterislandvet.com', '390047959', 'Shelter Island Vet - shelterislandvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Pups At Play - pupsatplay.net (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('pupsatplay.net', '390047249', 'Pups At Play - pupsatplay.net', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Puppywood Montgomery & Anderson - puppywood.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('puppywood.com', '390043847', 'Puppywood Montgomery & Anderson - puppywood.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Man''s Best Friend - mansbestfriend.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('mansbestfriend.com', '390042419', 'Man''s Best Friend - mansbestfriend.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Simonton Pets (124) - simontonpets.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('simontonpets.com', '390038984', 'Simonton Pets (124) - simontonpets.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Paw Print Inn - pawprintinn.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('pawprintinn.com', '390040808', 'Paw Print Inn - pawprintinn.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Peachtree Pets (formerly Puppy Tubs) - thepeachtreepets.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('thepeachtreepets.com', '390047346', 'Peachtree Pets (formerly Puppy Tubs) - thepeachtreepets.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Pet Nation Lodge - petnationlodge.net (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('petnationlodge.net', '390067324', 'Pet Nation Lodge - petnationlodge.net', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- K9 Kaos - k9kaos.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('k9kaos.com', '390040199', 'K9 Kaos - k9kaos.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Paws Plaza - paws-plaza.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('paws-plaza.com', '390033339', 'Paws Plaza - paws-plaza.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Joyful Paws - joyfulpawshotel.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('joyfulpawshotel.com', '390033661', 'Joyful Paws - joyfulpawshotel.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Norwichtown Pet Resort and Spa - norwichtownpetresort.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('norwichtownpetresort.com', '390029721', 'Norwichtown Pet Resort and Spa - norwichtownpetresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Southampton Pet Hospital - southamptonpethospital.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('southamptonpethospital.com', '390014879', 'Southampton Pet Hospital - southamptonpethospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Woof Room - woofroom.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('woofroom.com', '390042624', 'The Woof Room - woofroom.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Woof Pet Resort - woof-petresort.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('woof-petresort.com', '390044437', 'Woof Pet Resort - woof-petresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Simonton Veterinary Clinic / Simonton Pet - simontonvet.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('simontonvet.com', '390049696', 'Simonton Veterinary Clinic / Simonton Pet - simontonvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Jill''s Pet Resort - jillspetresort.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('jillspetresort.com', '390040813', 'Jill''s Pet Resort - jillspetresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Hound Dog (240/241/279) - hounddogpethotels.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('hounddogpethotels.com', '390058691', 'Hound Dog (240/241/279) - hounddogpethotels.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Happi & Friends - happiandfriends.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('happiandfriends.com', '390038778', 'Happi & Friends - happiandfriends.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Action Pack Dog Center - actionpackdogs.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('actionpackdogs.com', '390019263', 'Action Pack Dog Center - actionpackdogs.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Fondren 5 Star Pet Resort - fondren5starpetresort.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('fondren5starpetresort.com', '390028844', 'Fondren 5 Star Pet Resort - fondren5starpetresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dallas Pet Den - dallaspetden.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dallaspetden.com', '390039805', 'Dallas Pet Den - dallaspetden.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Gagnons Pet Resort - gagnonspetresort.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('gagnonspetresort.com', '390040054', 'Gagnons Pet Resort - gagnonspetresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Ashcroft Pet Resort - ashcroftpetresort.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('ashcroftpetresort.com', '390031648', 'Ashcroft Pet Resort - ashcroftpetresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dog Spot Hotel - dogspothotel.net (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dogspothotel.net', '390040057', 'Dog Spot Hotel - dogspothotel.net', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Bow Wow Bungalow - bowwowbungalow.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('bowwowbungalow.com', '390047963', 'Bow Wow Bungalow - bowwowbungalow.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Bark Hotel for Dogs - barkhotelfordogs.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('barkhotelfordogs.com', '390055557', 'Bark Hotel for Dogs - barkhotelfordogs.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Canal Bark - canalbark.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('canalbark.com', '390049707', 'Canal Bark - canalbark.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Seal Beach Animal Hospital - sealbeachanimalhospital.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('sealbeachanimalhospital.com', '390983939', 'Seal Beach Animal Hospital - sealbeachanimalhospital.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Exceptional Pets - exceptionalpets.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('exceptionalpets.com', '391063434', 'Exceptional Pets - exceptionalpets.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Deer Creek Animal Hospital - deercreekah.net (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('deercreekah.net', '392477043', 'Deer Creek Animal Hospital - deercreekah.net', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Prosper Dog Retreat - prosperdogretreat.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('prosperdogretreat.com', '392478299', 'Prosper Dog Retreat - prosperdogretreat.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Nebel St. Animal Hospital - nebelstah.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('nebelstah.com', '392137660', 'Nebel St. Animal Hospital - nebelstah.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Top Dog Retreat - topdogretreat.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('topdogretreat.com', '392484494', 'Top Dog Retreat - topdogretreat.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Pooch Palace Resort - poochpalaceresorts.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('poochpalaceresorts.com', '392479437', 'The Pooch Palace Resort - poochpalaceresorts.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- K9 Kampus - k9kampus.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('k9kampus.com', '392186562', 'K9 Kampus - k9kampus.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Cicero Animal Clinic - ciceroanimalclinic.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('ciceroanimalclinic.com', '394565419', 'Cicero Animal Clinic - ciceroanimalclinic.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Carefree Pet Resort - carefreepetresort.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('carefreepetresort.com', '394570720', 'Carefree Pet Resort - carefreepetresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Dog Spot & The Cat Pad - thepetspotco.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('thepetspotco.com', '394598600', 'The Dog Spot & The Cat Pad - thepetspotco.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Ortega Animal Care Center - oaccpets.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('oaccpets.com', '394584490', 'Ortega Animal Care Center - oaccpets.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Posh Paw Resort - poshpawresort.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('poshpawresort.com', '394597388', 'The Posh Paw Resort - poshpawresort.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Preventive Veterinary Medical Clinic - pvmcvet.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('pvmcvet.com', '395321606', 'Preventive Veterinary Medical Clinic - pvmcvet.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Bark & Lounge Kirkwood (215) - barkandlounge.net (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('barkandlounge.net', '415704408', 'Bark & Lounge Kirkwood (215) - barkandlounge.net', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Escape the Crate (230/231) - escapethecrate.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('escapethecrate.com', '415683523', 'Escape the Crate (230/231) - escapethecrate.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- New York Dog Spa & Hotel - dogspa.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dogspa.com', '415754091', 'New York Dog Spa & Hotel - dogspa.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Ruff Housing (178/179/180/181) - ruffhousing.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('ruffhousing.com', '415797618', 'Ruff Housing (178/179/180/181) - ruffhousing.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Wags Pet Resort - wagspetresort.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('wagspetresort.com', '415817821', 'Wags Pet Resort - wagspetresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Bow chika Wow Town - bowchikawowtown.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('bowchikawowtown.com', '415977599', 'Bow chika Wow Town - bowchikawowtown.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- BrownDog Vet Clinic - browndoglodge.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('browndoglodge.com', '416093740', 'BrownDog Vet Clinic - browndoglodge.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Club Fetch - clubfetch.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('clubfetch.com', '416115253', 'Club Fetch - clubfetch.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Collierville Canine Club - colliervillecanineclub.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('colliervillecanineclub.com', '416091119', 'Collierville Canine Club - colliervillecanineclub.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Grand Canine Pet Hotel - grandcaninehotel.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('grandcaninehotel.com', '416222955', 'Grand Canine Pet Hotel - grandcaninehotel.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dog Pawz Leawood / Leawood Dog Paws Play N Stay - dogpawz.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dogpawz.com', '416200443', 'Dog Pawz Leawood / Leawood Dog Paws Play N Stay - dogpawz.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Dog Dayz of California - dogdayzofcalifornia.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('dogdayzofcalifornia.com', '416206289', 'Dog Dayz of California - dogdayzofcalifornia.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- KennelCare Pet Resort & Spa - thekennelcare.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('thekennelcare.com', '416421990', 'KennelCare Pet Resort & Spa - thekennelcare.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Loyal Canines Fitness & Training - loyalcanines.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('loyalcanines.com', '416398557', 'Loyal Canines Fitness & Training - loyalcanines.com', 'website', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Sunny Acres Pet Resort - sunnyacrespetresort.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('sunnyacrespetresort.com', '416433705', 'Sunny Acres Pet Resort - sunnyacrespetresort.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Yourgi National - yourgipet.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('yourgipet.com', '416423688', 'Yourgi National - yourgipet.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- The Pet Spot - thepetspotco.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('thepetspotco.com', '416411355', 'The Pet Spot - thepetspotco.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Petz Plaza - petzplaza.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('petzplaza.com', '416413834', 'Petz Plaza - petzplaza.com', 'pet-services', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Valley Lyons Veterinary Hospital - valleylyonsvets.com (Destination Pet 3)
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('valleylyonsvets.com', '416382858', 'Valley Lyons Veterinary Hospital - valleylyonsvets.com', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();
