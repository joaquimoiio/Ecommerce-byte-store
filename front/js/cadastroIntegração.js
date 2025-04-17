const apiUrl = 'http://localhost:8081/cliente'

document.getElementById('sendDataBtn').addEventListener('click',function(){
    const idCliente = document.getElementById('idCliente').value;
    const nuCpf = document.getElementById('vlProduto').value;
    const dsEmail = document.getElementById('dsEmail').value;
    const dsSenha = document.getElementById('dsSenha').value;
    const nuTelefone = document.getElementById('nuTelefone').value;

    if (idCliente && nuCpf && dsEmail && dsSenha && nuTelefone){
        const payload = {
            idCliente: parseInt(idCliente),
            nuCpf: parseInt(nuCpf,11),
            dsEmail: dsEmail,
            dsSenha: dsSenha,
            nuTelefone: nuTelefone
        };

        fetch(apiUrl,{
            method: 'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response =>{
            if(!response.ok){
                throw new Error(`Erro ao enviar dados: ${response.status}`);
            }
            return response.json();
        })
        .then(data =>{
            alert('Dados enviados com sucesso!');
            console.log('Responde da API>',data);
        })
        .catch(error =>{
            alert(`Erro: ${error.message}`);
        });
    }else {
        alert('Por favor, preencha todos os todos os campos.')
    }
});