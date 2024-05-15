use crate::data_structures::*;

pub fn process_clientes(existing_clientes: &mut Vec<Cliente>, clientes_dto: Vec<ClienteDTO>) {
    for cliente_dto in clientes_dto {
        match existing_clientes
            .iter_mut()
            .find(|c| c.nome_cliente == cliente_dto.nome_cliente)
        {
            Some(cliente) => {
                for maquina_dto in cliente_dto.maquinas {
                    match cliente
                        .maquinas
                        .iter_mut()
                        .find(|m| m.n_serie == maquina_dto.n_serie)
                    {
                        Some(maquina) => {
                            for leitura_dto in maquina_dto.leituras {
                                match maquina
                                    .leituras
                                    .iter_mut()
                                    .find(|l| l.data_leitura == leitura_dto.data_leitura)
                                {
                                    Some(leitura) => {
                                        for grupo_dto in leitura_dto.leitura {
                                            let grupo = leitura.leitura.iter_mut().find(|g| {
                                                g.tensao == grupo_dto.tensao
                                                    && g.unidades == grupo_dto.unidades
                                            });
                                            if let Some(existing_grupo) = grupo {
                                                existing_grupo.medicoes.extend(
                                                    grupo_dto
                                                        .medicoes
                                                        .into_iter()
                                                        .map(Medicao::from_dto),
                                                );
                                            } else {
                                                leitura
                                                    .leitura
                                                    .push(LeituraGrupo::from_dto(grupo_dto));
                                            }
                                        }
                                    }
                                    None => {
                                        let new_leitura = Leitura::from_dto(leitura_dto);
                                        maquina.leituras.push(new_leitura);
                                    }
                                }
                            }
                        }
                        None => {
                            let new_maquina = Maquina::from_dto(maquina_dto);
                            cliente.maquinas.push(new_maquina);
                        }
                    }
                }
            }
            None => {
                let new_cliente = Cliente::from_dto(cliente_dto);
                existing_clientes.push(new_cliente);
            }
        }
    }
}
