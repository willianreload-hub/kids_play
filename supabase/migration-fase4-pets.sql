-- ==============================================================================
-- KIDS-PLAYER — MIGRAÇÃO FASE 4.1: 5 PETS DOS BIOMAS BRASILEIROS
-- Adiciona os pets do Cerrado, Pampa, Mata Atlântica, Amazônia e Pantanal ao
-- catálogo em nuvem (o schema.sql já inclui os mesmos registros para novas
-- instalações). Idempotente: pode rodar mais de uma vez.
-- Como rodar: Supabase -> SQL Editor -> cole TODO este arquivo -> Run.
-- ==============================================================================

INSERT INTO public.pets (id, name, species, rarity, description, sprite_key, base_power) VALUES
    ('tatu_cerrado', 'Bolinha', 'Tatuzinho do Cerrado', 'normal', 'Um tatuzinho corajoso do Cerrado que vira uma bolinha de armadura quando precisa de coragem extra!', 'pet_armadillo', 14),
    ('prea_pampa', 'Saltitante', 'Preá do Campo', 'normal', 'Um roedorzinho ágil do Pampa que salta de alegria com cada resposta certa sua!', 'pet_prea', 12),
    ('tucano_mata', 'Tuc', 'Tucano da Mata Atlântica', 'raro', 'O guardião das cores da Mata Atlântica, com um bico gigante para anunciar suas vitórias!', 'pet_toucan', 32),
    ('boto_amazonia', 'Lumi', 'Boto Cor-de-Rosa', 'epico', 'Um boto mágico dos rios da Amazônia que ilumina o caminho das respostas certas!', 'pet_dolphin', 60),
    ('arara_pantanal', 'Céu', 'Arara Azul do Pantanal', 'lendario', 'A arara mais rara do Pantanal! Suas asas azuis carregam a sorte dos grandes campeões.', 'pet_macaw', 88)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    species = EXCLUDED.species,
    rarity = EXCLUDED.rarity,
    description = EXCLUDED.description,
    sprite_key = EXCLUDED.sprite_key,
    base_power = EXCLUDED.base_power;
