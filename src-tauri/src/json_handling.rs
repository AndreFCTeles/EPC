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
                            for verificacao_dto in maquina_dto.verificacoes {
                                let verificacao = maquina
                                    .verificacoes
                                    .iter_mut()
                                    .find(|v| v.v_fio == verificacao_dto.v_fio);
                                if let Some(verificacao) = verificacao {
                                    verificacao.leituras.extend(
                                        verificacao_dto.leituras.into_iter().map(Leitura::from_dto), // Use into_iter() to consume and pass ownership
                                    );
                                } else {
                                    maquina
                                        .verificacoes
                                        .push(Verificacao::from_dto(verificacao_dto));
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
