# 🚀 Agile K3s Academic Recommendation System new
A **data-driven platform** designed to recommend Master’s degree specializations based on a student’s academic performance (S1–S6).

The system is tailored to the **French/Moroccan university structure** and leverages a **Machine Learning model** to provide automated academic orientation.

---

## 🧰 Tech Stack

| Layer            | Technology |
|------------------|-----------|
| **Frontend**     | React + shadcn/ui (served via Nginx) |
| **Backend**      | Flask (Python) + SQLite |
| **Infrastructure** | Azure (Spain Central) via Terraform |
| **Configuration** | Ansible |
| **Orchestration** | K3s (Lightweight Kubernetes) |
| **CI/CD**        | GitHub Actions + DockerHub |

---

## 📂 Project Architecture

```plaintext
agile-k3s-project/
├── .github/workflows/deploy.yml
├── terraform/
│   └── main.tf
├── ansible/
│   ├── ansible.cfg
│   ├── inventory.ini
│   ├── playbook.yml
│   └── roles/
│       ├── common/
│       ├── k3s_master/
│       └── k3s_worker/
├── kubernetes/
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── services.yaml
│   ├── ingress.yaml
│   └── persistent-volume.yaml
├── agile-frontend/   # React SPA
└── agile-backend/    # Flask AI Engine