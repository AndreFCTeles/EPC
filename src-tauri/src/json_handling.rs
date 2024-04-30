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
                                let existing_leitura = maquina.leituras.iter_mut().find(|l| {
                                    l.data_leitura == leitura_dto.data_leitura
                                        && l.tensao == leitura_dto.tensao
                                        && l.unidades == leitura_dto.unidades
                                });

                                if let Some(leitura) = existing_leitura {
                                    // Aggregate all Medicoes into the found leitura
                                    leitura.medicoes.extend(
                                        leitura_dto.medicoes.into_iter().map(Medicao::from_dto),
                                    );
                                } else {
                                    // If no existing leitura matches, create a new one from the DTO
                                    let new_leitura = Leitura::from_dto(leitura_dto);
                                    maquina.leituras.push(new_leitura);
                                }
                            }
                        }
                        None => cliente.maquinas.push(Maquina::from_dto(maquina_dto)),
                    }
                }
            }
            None => {
                existing_clientes.push(Cliente::from_dto(cliente_dto));
            }
        }
    }
}
