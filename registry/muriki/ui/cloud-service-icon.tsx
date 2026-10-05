/**
 * Cloud Service Icon — o ícone oficial de um serviço de nuvem (AWS, GCP,
 * Azure), pelo id do catálogo `<provedor>.<serviço>` (aws.sqs).
 *
 * Os SVGs são os dos pacotes oficiais, sem alteração, e entram pelo registry
 * em public/cloud-icons/<provedor>/<serviço>.svg. Vão por <img>, nunca
 * inline: o pacote da AWS repete id="linearGradient-1" e um ícone pintaria o
 * outro. Como é <img>, só baixa o que aparece na tela.
 *
 * As regras dos três pacotes pedem o nome do serviço perto do ícone e nunca
 * dentro dele: quem usa mostra o `name` do catálogo ao lado.
 *
 * Id fora do catálogo não tem ícone: `cloudServiceIconSrc` devolve null e o
 * componente não desenha nada, para quem usa cair no ícone genérico da peça.
 */
import type * as React from "react"

import { cn } from "@/lib/utils"

/** Os ids do catálogo (muriki-content catalog/services.yaml, pacote 2026.10.05-1) com ícone curado. */
export const CLOUD_SERVICE_ICON_IDS = new Set([
  "aws.lambda",
  "aws.ecs",
  "aws.eks",
  "aws.ec2",
  "aws.rds",
  "aws.aurora",
  "aws.dynamodb",
  "aws.elasticache",
  "aws.sqs",
  "aws.eventbridge",
  "aws.sns",
  // o pacote não tem ícone próprio do Scheduler: é o do EventBridge
  "aws.eventbridge-scheduler",
  "aws.cloudfront",
  "aws.elb",
  "aws.s3",
  "aws.api-gateway",
  "aws.cognito",
  "aws.opensearch",
  "aws.cloudwatch",
  "aws.secrets-manager",
  "aws.appsync",
  "aws.batch",
  "aws.ses",
  "aws.kinesis-data-streams",
  "aws.msk",
  "aws.route-53",
  "aws.waf",
  "aws.redshift",
  "aws.ecr",
  "gcp.cloud-run",
  "gcp.cloud-run-functions",
  "gcp.gke",
  "gcp.compute-engine",
  "gcp.cloud-sql",
  "gcp.alloydb",
  "gcp.spanner",
  "gcp.firestore",
  "gcp.memorystore",
  "gcp.pubsub",
  "gcp.cloud-tasks",
  "gcp.eventarc",
  "gcp.cloud-scheduler",
  "gcp.cloud-cdn",
  "gcp.cloud-load-balancing",
  "gcp.cloud-storage",
  "gcp.api-gateway",
  "gcp.apigee",
  "gcp.identity-platform",
  "gcp.cloud-monitoring",
  "gcp.cloud-logging",
  "gcp.secret-manager",
  // o Cloud Run jobs não tem ícone próprio: é o do Cloud Run
  "gcp.cloud-run-jobs",
  "gcp.batch",
  // sem ícone próprio no pacote do Google: o da categoria Data Analytics, como o Google orienta
  "gcp.managed-kafka",
  // do pacote de marca do Firebase
  "gcp.firebase-cloud-messaging",
  "gcp.cloud-dns",
  "gcp.cloud-armor",
  "gcp.bigquery",
  "gcp.artifact-registry",
  "azure.functions",
  "azure.container-apps",
  "azure.aks",
  "azure.virtual-machines",
  "azure.app-service",
  "azure.sql-database",
  "azure.database-for-postgresql",
  "azure.cosmos-db",
  "azure.managed-redis",
  "azure.service-bus",
  "azure.queue-storage",
  "azure.event-grid",
  "azure.event-hubs",
  "azure.logic-apps",
  "azure.front-door",
  "azure.load-balancer",
  "azure.application-gateway",
  "azure.blob-storage",
  "azure.api-management",
  "azure.entra-id",
  "azure.entra-external-id",
  "azure.ai-search",
  "azure.monitor",
  "azure.application-insights",
  "azure.key-vault",
  "azure.web-pubsub",
  "azure.signalr",
  // o Container Apps jobs não tem ícone próprio: é o do Container Apps
  "azure.container-apps-jobs",
  "azure.batch",
  "azure.communication-services",
  "azure.notification-hubs",
  "azure.dns",
  "azure.web-application-firewall",
  "azure.synapse-analytics",
  "azure.container-registry",
])

/** O caminho público do ícone, ou null se o id não tem ícone curado. */
export function cloudServiceIconSrc(id: string): string | null {
  if (!CLOUD_SERVICE_ICON_IDS.has(id)) return null
  const [provider, service] = id.split(".")
  return `/cloud-icons/${provider}/${service}.svg`
}

export interface CloudServiceIconProps
  extends Omit<React.ComponentProps<"img">, "src" | "alt" | "children"> {
  /** O id do catálogo, `<provedor>.<serviço>`. */
  service: string
}

/** Decorativo: o nome do serviço vai ao lado, em texto. */
function CloudServiceIcon({ service, className, ...props }: CloudServiceIconProps) {
  const src = cloudServiceIconSrc(service)
  if (!src) return null
  return (
    <img
      data-slot="cloud-service-icon"
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      loading="lazy"
      decoding="async"
      className={cn("size-6 shrink-0 object-contain", className)}
      {...props}
    />
  )
}

export { CloudServiceIcon }
