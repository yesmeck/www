import type { AWS } from '@serverless/typescript';

import buildPackages from '@functions/buildPackages';
import ipfsUpload from '@functions/ipfsUpload';

const serverlessConfiguration: AWS = {
  service: 'lambdas',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      AWS_DIST_BUCKET: '',
    },
    iam: {
      deploymentRole: `arn:aws:iam::${process.env.AWS_ACCOUNT_ID || '640264234305'}:role/CloudFormationExecutionRole`,
      role: {
        statements: [
          {
            "Effect": "Allow",
            "Resource": [
              "arn:aws:s3:::dist.tea.xyz",
              "arn:aws:s3:::dist.tea.xyz/*",
              "arn:aws:s3:::dist.tea.xyz/*/*",
            ],
            "Action": [
                "s3:GetBucketAcl",
                "s3:List",
                "s3:ListBucket",
                "s3:PutObject"
            ]
          }
        ]
      }
    },
    vpc: {
      securityGroupIds: [
        "${ssm:/vpc/sg/serverless_lambdas}",
      ],
      subnetIds: [
        "${ssm:/vpc/subnets/private_1}",
        "${ssm:/vpc/subnets/private_2}"
      ]
    }
  },
  // import the function via paths
  functions: {
    buildPackages,
    ipfsUpload,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;